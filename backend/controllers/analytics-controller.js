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
      `SELECT category as name, COUNT(*)::integer as value 
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
        ),
        ProdAgg AS (
          SELECT date_trunc('month', production_date) as p_date, SUM(quantity_produced) as volume
          FROM Production_Batches
          GROUP BY date_trunc('month', production_date)
        ),
        TransAgg AS (
          SELECT date_trunc('month', transfer_date) as t_date, SUM(quantity_transferred) as transferred
          FROM Service_Transfers
          GROUP BY date_trunc('month', transfer_date)
        )
        SELECT 
          to_char(m.month_start, 'Mon') as name,
          COALESCE(p.volume, 0)::integer as volume,
          COALESCE(t.transferred, 0)::integer as transferred
        FROM Last12Months m
        LEFT JOIN ProdAgg p ON p.p_date = m.month_start
        LEFT JOIN TransAgg t ON t.t_date = m.month_start
        ORDER BY m.month_start;
      `;
    } else if (timeframe === 'monthly') {
      volumeQuery = `
        WITH Last4Weeks AS (
          SELECT date_trunc('week', CURRENT_DATE - interval '1 week' * i) AS week_start
          FROM generate_series(3, 0, -1) i
        ),
        ProdAgg AS (
          SELECT date_trunc('week', production_date) as p_date, SUM(quantity_produced) as volume
          FROM Production_Batches
          GROUP BY date_trunc('week', production_date)
        ),
        TransAgg AS (
          SELECT date_trunc('week', transfer_date) as t_date, SUM(quantity_transferred) as transferred
          FROM Service_Transfers
          GROUP BY date_trunc('week', transfer_date)
        )
        SELECT 
          'Wk ' || to_char(w.week_start, 'W') as name,
          COALESCE(p.volume, 0)::integer as volume,
          COALESCE(t.transferred, 0)::integer as transferred
        FROM Last4Weeks w
        LEFT JOIN ProdAgg p ON p.p_date = w.week_start
        LEFT JOIN TransAgg t ON t.t_date = w.week_start
        ORDER BY w.week_start;
      `;
    } else {
      volumeQuery = `
        WITH Last7Days AS (
          SELECT (CURRENT_DATE - i) AS date_val
          FROM generate_series(6, 0, -1) i
        ),
        ProdAgg AS (
          SELECT DATE(production_date) as p_date, SUM(quantity_produced) as volume
          FROM Production_Batches
          GROUP BY DATE(production_date)
        ),
        TransAgg AS (
          SELECT DATE(transfer_date) as t_date, SUM(quantity_transferred) as transferred
          FROM Service_Transfers
          GROUP BY DATE(transfer_date)
        )
        SELECT 
          to_char(d.date_val, 'Dy') as name,
          COALESCE(p.volume, 0)::integer as volume,
          COALESCE(t.transferred, 0)::integer as transferred
        FROM Last7Days d
        LEFT JOIN ProdAgg p ON p.p_date = d.date_val
        LEFT JOIN TransAgg t ON t.t_date = d.date_val
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

// Endpoint separat pentru graficul comparativ Producție vs. Vânzări
export const getComparisonData = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'weekly';
    const recipeId = req.query.recipe_id || null;

    // Filtru opțional pe rețetă
    const prodFilter = recipeId ? `WHERE recipe_id = ${parseInt(recipeId)}` : '';
    const transFilter = recipeId ? `WHERE recipe_id = ${parseInt(recipeId)}` : '';

    let query = '';

    if (timeframe === 'yearly') {
      query = `
        WITH Last12Months AS (
          SELECT date_trunc('month', CURRENT_DATE - interval '1 month' * i) AS period
          FROM generate_series(11, 0, -1) i
        ),
        ProdAgg AS (
          SELECT date_trunc('month', production_date) as p_date, SUM(quantity_produced) as volume
          FROM Production_Batches ${prodFilter}
          GROUP BY date_trunc('month', production_date)
        ),
        TransAgg AS (
          SELECT date_trunc('month', transfer_date) as t_date, SUM(quantity_transferred) as transferred
          FROM Service_Transfers ${transFilter}
          GROUP BY date_trunc('month', transfer_date)
        )
        SELECT 
          to_char(m.period, 'Mon') as name,
          COALESCE(p.volume, 0)::integer as volume,
          COALESCE(t.transferred, 0)::integer as transferred
        FROM Last12Months m
        LEFT JOIN ProdAgg p ON p.p_date = m.period
        LEFT JOIN TransAgg t ON t.t_date = m.period
        ORDER BY m.period;
      `;
    } else if (timeframe === 'monthly') {
      query = `
        WITH Last4Weeks AS (
          SELECT date_trunc('week', CURRENT_DATE - interval '1 week' * i) AS period
          FROM generate_series(3, 0, -1) i
        ),
        ProdAgg AS (
          SELECT date_trunc('week', production_date) as p_date, SUM(quantity_produced) as volume
          FROM Production_Batches ${prodFilter}
          GROUP BY date_trunc('week', production_date)
        ),
        TransAgg AS (
          SELECT date_trunc('week', transfer_date) as t_date, SUM(quantity_transferred) as transferred
          FROM Service_Transfers ${transFilter}
          GROUP BY date_trunc('week', transfer_date)
        )
        SELECT 
          'Wk ' || to_char(w.period, 'W') as name,
          COALESCE(p.volume, 0)::integer as volume,
          COALESCE(t.transferred, 0)::integer as transferred
        FROM Last4Weeks w
        LEFT JOIN ProdAgg p ON p.p_date = w.period
        LEFT JOIN TransAgg t ON t.t_date = w.period
        ORDER BY w.period;
      `;
    } else {
      query = `
        WITH Last7Days AS (
          SELECT (CURRENT_DATE - i) AS period
          FROM generate_series(6, 0, -1) i
        ),
        ProdAgg AS (
          SELECT DATE(production_date) as p_date, SUM(quantity_produced) as volume
          FROM Production_Batches ${prodFilter}
          GROUP BY DATE(production_date)
        ),
        TransAgg AS (
          SELECT DATE(transfer_date) as t_date, SUM(quantity_transferred) as transferred
          FROM Service_Transfers ${transFilter}
          GROUP BY DATE(transfer_date)
        )
        SELECT 
          to_char(d.period, 'Dy') as name,
          COALESCE(p.volume, 0)::integer as volume,
          COALESCE(t.transferred, 0)::integer as transferred
        FROM Last7Days d
        LEFT JOIN ProdAgg p ON p.p_date = d.period
        LEFT JOIN TransAgg t ON t.t_date = d.period
        ORDER BY d.period;
      `;
    }

    const { rows: comparisonData } = await db.query(query);

    // Lista de rețete pentru dropdown
    const { rows: recipes } = await db.query(
      `SELECT id, name FROM Recipe ORDER BY name`
    );

    res.status(200).json({ comparisonData, recipes });
  } catch (error) {
    console.error('Comparison Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
};
