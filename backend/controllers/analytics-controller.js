import db from '../db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. KPI: Low Stock Alerts Count
    const { rows: lowStockRows } = await db.query(
      `SELECT COUNT(*) as count FROM Ingredient WHERE current_stock <= alert_threshold`
    );

    // 2. KPI: Active Marmites in Cold Storage
    const { rows: activeMarmitesRows } = await db.query(
      `SELECT COALESCE(SUM(current_quantity), 0) as total FROM finished_soups`
    );

    // 3. KPI: Total Registered Ingredients
    const { rows: totalIngredientsRows } = await db.query(
      `SELECT COUNT(*) as count FROM Ingredient`
    );

    // 4. Distribuția pe Categorii
    const { rows: categoryDistribution } = await db.query(
      `SELECT category as name, COUNT(*) as value 
       FROM Ingredient 
       WHERE category IS NOT NULL 
       GROUP BY category`
    );

    // 5. Top Rețete Performante
    const { rows: topRecipes } = await db.query(
      `SELECT r.name, COUNT(pb.id) as frequency, SUM(pb.quantity_produced) as total_volume 
       FROM Production_Batches pb 
       JOIN Recipe r ON pb.recipe_id = r.id 
       GROUP BY r.name 
       ORDER BY total_volume DESC 
       LIMIT 4`
    );

    // 6. Ingrediente Care Necesită Atenție
    const { rows: criticalStock } = await db.query(
      `SELECT name, current_stock, alert_threshold 
       FROM Ingredient 
       WHERE current_stock <= alert_threshold 
       ORDER BY (current_stock / NULLIF(alert_threshold, 0)) ASC 
       LIMIT 4`
    );

    const timeframe = req.query.timeframe || 'weekly';
    let volumeQuery = '';

    if (timeframe === 'yearly') {
      volumeQuery = `
        WITH Last12Months AS (
          SELECT date_trunc('month', CURRENT_DATE - interval '1 month' * i) AS month_start
          FROM generate_series(11, 0, -1) i
        )
        SELECT 
          to_char(m.month_start, 'Mon') as name,
          COALESCE(SUM(pb.quantity_produced), 0)::integer as volume
        FROM Last12Months m
        LEFT JOIN Production_Batches pb 
          ON date_trunc('month', pb.production_date) = m.month_start
        GROUP BY m.month_start
        ORDER BY m.month_start;
      `;
    } else if (timeframe === 'monthly') {
      volumeQuery = `
        WITH Last4Weeks AS (
          SELECT date_trunc('week', CURRENT_DATE - interval '1 week' * i) AS week_start
          FROM generate_series(3, 0, -1) i
        )
        SELECT 
          'Wk ' || to_char(w.week_start, 'W') as name,
          COALESCE(SUM(pb.quantity_produced), 0)::integer as volume
        FROM Last4Weeks w
        LEFT JOIN Production_Batches pb 
          ON date_trunc('week', pb.production_date) = w.week_start
        GROUP BY w.week_start
        ORDER BY w.week_start;
      `;
    } else {
      volumeQuery = `
        WITH Last7Days AS (
          SELECT (CURRENT_DATE - i) AS date_val
          FROM generate_series(6, 0, -1) i
        )
        SELECT 
          to_char(d.date_val, 'Dy') as name,
          COALESCE(SUM(pb.quantity_produced), 0)::integer as volume
        FROM Last7Days d
        LEFT JOIN Production_Batches pb 
          ON DATE(pb.production_date) = d.date_val
        GROUP BY d.date_val
        ORDER BY d.date_val;
      `;
    }

    const { rows: volumeData } = await db.query(volumeQuery);

    // NOU: Interogare pentru Top 5 cele mai consumate ingrediente
    // Împărțim la 50.0 pentru a converti "Litrii" salvați în DB înapoi în "batches" pentru a înmulți cu rețetarul
    const { rows: topIngredients } = await db.query(`
      SELECT 
        i.name,
        i.unit_of_measure as unit,
        ROUND(CAST(SUM((pb.quantity_produced / 50.0) * ri.quantity_required) AS numeric), 2) as use
      FROM Production_Batches pb
      JOIN Recipe_Ingredient ri ON pb.recipe_id = ri.recipe_id
      JOIN Ingredient i ON ri.ingredient_id = i.id
      GROUP BY i.name, i.unit_of_measure
      ORDER BY use DESC
      LIMIT 5
    `);

    // Trimitem totul ca un singur pachet JSON curat
    res.status(200).json({
      kpis: {
        lowStockAlerts: parseInt(lowStockRows[0].count, 10),
        activeMarmites: parseInt(activeMarmitesRows[0].total, 10),
        totalIngredients: parseInt(totalIngredientsRows[0].count, 10),
        productionEfficiency: 92, // O lăsăm fixă momentan
      },
      charts: {
        categoryDistribution,
        topRecipes,
        criticalStock,
        volumeData,
        topIngredients,
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};
