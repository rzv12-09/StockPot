import React, { useState, useEffect } from 'react';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
  getSuppliers,
  createSupplier,
} from '../services/invoiceService';
import { getIngredients } from '../services/ingredientsService';
import { translateUnit } from '../utils/translations';

const Invoices = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  
  // Data states
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [supplierId, setSupplierId] = useState('');
  const [newSupplierName, setNewSupplierName] = useState(''); // for quick create
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState(null);
  const [items, setItems] = useState([
    { id: Date.now(), ingredient_id: '', quantity: '', unit_price: '' }
  ]);

  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [expandedInvoiceData, setExpandedInvoiceData] = useState(null);
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const TVA_RATE = 0.11; // 11% TVA

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invData, supData, ingData] = await Promise.all([
        getInvoices(),
        getSuppliers(),
        getIngredients()
      ]);
      setInvoices(invData);
      setSuppliers(supData);
      setIngredients(ingData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), ingredient_id: '', quantity: '', unit_price: '' }]);
  };

  const handleRemoveItem = (idToRemove) => {
    setItems(items.filter(item => item.id !== idToRemove));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unit_price) || 0;
      return sum + (q * p);
    }, 0);
  };

  const handleExpandRow = async (invId) => {
    if (expandedInvoiceId === invId) {
      setExpandedInvoiceId(null);
      setExpandedInvoiceData(null);
      return;
    }
    
    setExpandedInvoiceId(invId);
    setExpandedInvoiceData(null); 
    try {
      const data = await getInvoiceById(invId);
      setExpandedInvoiceData(data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert('Eroare la încărcarea detaliilor facturii.');
    }
  };

  const handleSaveInvoice = async () => {
    try {
      let finalSupplierId = supplierId;

      // Handle quick supplier creation
      if (supplierId === 'NEW' && newSupplierName.trim()) {
        const newSup = await createSupplier({ name: newSupplierName });
        finalSupplierId = newSup.id;
        setSuppliers([...suppliers, newSup]);
      }

      if (!finalSupplierId || finalSupplierId === 'NEW') {
        alert('Te rugăm să selectezi sau să creezi un furnizor.');
        return;
      }

      if (!invoiceNumber || !issueDate) {
        alert('Te rugăm să completezi toate detaliile facturii.');
        return;
      }

      const validItems = items.filter(item => item.ingredient_id && item.quantity && item.unit_price);
      if (validItems.length === 0) {
        alert('Te rugăm să adaugi cel puțin un articol valid.');
        return;
      }

      let payload;
      if (imageFile) {
        payload = new FormData();
        payload.append('supplier_id', finalSupplierId);
        payload.append('invoice_number', invoiceNumber);
        payload.append('issue_date', issueDate);
        payload.append('image', imageFile);
        payload.append('items', JSON.stringify(
          validItems.map(item => ({
            ingredient_id: item.ingredient_id,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price)
          }))
        ));
      } else {
        payload = {
          supplier_id: finalSupplierId,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          items: validItems.map(item => ({
            ingredient_id: item.ingredient_id,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price)
          }))
        };
      }

      await createInvoice(payload);
      
      // Reset form and go to list
      setSupplierId('');
      setNewSupplierName('');
      setInvoiceNumber('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setImageFile(null);
      setItems([{ id: Date.now(), ingredient_id: '', quantity: '', unit_price: '' }]);
      setView('list');
      loadData();

    } catch (err) {
      alert(err.message || 'Salvarea facturii a eșuat.');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această factură? Articolele aferente vor fi de asemenea șterse, dar stocul NU va fi modificat automat.')) return;
    try {
      await deleteInvoice(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Ștergerea facturii a eșuat.');
    }
  };

  if (isLoading) {
    return <div className="text-slate-500 p-8">Se încarcă facturile...</div>;
  }

  // LIST VIEW
  if (view === 'list') {
    return (
      <div className="flex-1 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Facturi (Recepție Marfă)
            </h2>
            <p className="font-body text-slate-500 text-sm max-w-2xl">
              Istoric facturi furnizori și achiziții ingrediente.
            </p>
          </div>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 bg-gradient-to-b from-orange-600 to-orange-700 text-white px-6 py-3 rounded-md font-manrope font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
            Factură Nouă
          </button>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm rounded-xl pb-4 overflow-hidden">
          <div className="w-full text-left font-body">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 mb-2">
              <div className="col-span-3 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">Furnizor</div>
              <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">Număr</div>
              <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">Dată</div>
              <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Articole</div>
              <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total (RON)</div>
              <div className="col-span-1 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acțiuni</div>
            </div>

            <div className="space-y-1 px-2">
              {invoices.map((inv) => (
                <React.Fragment key={inv.id}>
                  <div 
                    onClick={() => handleExpandRow(inv.id)}
                    className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg items-center hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="col-span-3 font-semibold text-sm text-slate-800">{inv.supplier_name}</div>
                    <div className="col-span-2 text-sm text-slate-600">{inv.invoice_number}</div>
                    <div className="col-span-2 text-sm text-slate-600">{new Date(inv.issue_date).toLocaleDateString()}</div>
                    <div className="col-span-2 text-sm text-slate-600 text-right">{inv.item_count}</div>
                    <div className="col-span-2 text-sm font-bold text-orange-700 text-right">{Number(inv.total_amount).toFixed(2)}</div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(inv.id); }}
                        className="w-8 h-8 rounded-md bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="Șterge Factura"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                  {expandedInvoiceId === inv.id && (
                    <div className="col-span-12 px-8 py-6 bg-slate-50 border-y border-slate-200 mt-1 mb-3 rounded-lg shadow-inner">
                      {!expandedInvoiceData ? (
                        <div className="text-slate-500 font-body text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                          Se încarcă detaliile...
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1">
                            <h4 className="font-manrope font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-orange-600 text-[20px]">kitchen</span>
                              Articole Factură
                            </h4>
                            <table className="w-full text-left font-body text-sm">
                              <thead className="text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="pb-2">Ingredient</th>
                                  <th className="pb-2 text-right">Cantitate</th>
                                  <th className="pb-2 text-right">Preț Unitar</th>
                                  <th className="pb-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {expandedInvoiceData.items.map(item => (
                                  <tr key={item.id}>
                                    <td className="py-2 text-slate-800 font-medium">{item.ingredient_name}</td>
                                    <td className="py-2 text-slate-600 text-right">{item.quantity} <span className="text-xs uppercase ml-0.5">{translateUnit(item.unit_of_measure)}</span></td>
                                    <td className="py-2 text-slate-600 text-right">{item.unit_price} RON</td>
                                    <td className="py-2 font-bold text-orange-700 text-right">{(item.quantity * item.unit_price).toFixed(2)} RON</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {expandedInvoiceData.image_url && (
                            <div className="w-full md:w-1/3 flex flex-col gap-2 md:border-l md:border-slate-200 md:pl-8">
                              <h4 className="font-manrope font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-600 text-[20px]">image</span>
                                Imagine Factură
                              </h4>
                              <a href={`${baseUrl}${expandedInvoiceData.image_url}`} target="_blank" rel="noreferrer" className="block hover:opacity-90 transition-opacity">
                                <img src={`${baseUrl}${expandedInvoiceData.image_url}`} alt="Factura" className="w-full h-auto max-h-48 object-cover rounded-lg border border-slate-200 shadow-sm" />
                              </a>
                              <a href={`${baseUrl}${expandedInvoiceData.image_url}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-orange-600 hover:underline mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                Vezi la dimensiune completă
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-8 text-slate-500 font-medium">Nu există facturi înregistrate.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CREATE VIEW
  const total = calculateTotal();
  const tvaEstimat = total * TVA_RATE;

  return (
    <div className="flex-1">
      <header className="mb-10">
        <h1 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Recepție Marfă (Facturi Furnizori)</h1>
        <p className="font-body text-slate-500 text-sm max-w-2xl">Introducerea facturilor de la furnizori pentru actualizarea stocului de ingrediente. Asigurați-vă că detaliile corespund exact cu documentul fizic.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Invoice Details Card */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="font-manrope text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">receipt_long</span>
              Detalii Factură
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-body text-sm font-semibold text-slate-700" htmlFor="supplier">Furnizor</label>
                <select 
                  id="supplier"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 font-body text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                >
                  <option value="">Selectează furnizor...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                  <option value="NEW">+ Adaugă furnizor nou</option>
                </select>
                {supplierId === 'NEW' && (
                  <input 
                    type="text" 
                    placeholder="Nume furnizor nou" 
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 font-body text-sm text-slate-900 mt-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-body text-sm font-semibold text-slate-700" htmlFor="doc-number">Număr Factură / NIR</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">tag</span>
                  <input 
                    id="doc-number" 
                    type="text" 
                    placeholder="Ex: FAC-2023-892" 
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 font-body text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-body text-sm font-semibold text-slate-700" htmlFor="date">Data Emiterii</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
                  <input 
                    id="date" 
                    type="date" 
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 font-body text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-body text-sm font-semibold text-slate-700" htmlFor="image">Poză Factură (Opțional)</label>
                <input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 font-body text-sm text-slate-900 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Dynamic Items Table */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center">
              <h2 className="font-manrope text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">kitchen</span>
                Ingrediente Recepționate
              </h2>
            </div>

            <div className="w-full overflow-x-auto mt-6">
              <table className="w-full text-left font-body text-sm">
                <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-4 px-6">Ingredient</th>
                    <th className="py-4 px-6 w-32">Cantitate</th>
                    <th className="py-4 px-6 w-36">Preț Unitar (RON)</th>
                    <th className="py-4 px-6 w-32 text-right">Total Linie</th>
                    <th className="py-4 px-6 w-16"></th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const q = parseFloat(item.quantity) || 0;
                    const p = parseFloat(item.unit_price) || 0;
                    const lineTotal = (q * p).toFixed(2);
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <select 
                            value={item.ingredient_id}
                            onChange={(e) => handleItemChange(item.id, 'ingredient_id', e.target.value)}
                            className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-orange-600 focus:ring-0 px-2 py-1 text-sm text-slate-800 transition-all"
                          >
                            <option value="">Selectează...</option>
                            {ingredients.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name} ({translateUnit(ing.unit_of_measure)})</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <input 
                            type="number" 
                            min="0" step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-orange-600 focus:ring-0 px-2 py-1 text-sm text-slate-800 text-right transition-all" 
                            placeholder="0"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input 
                            type="number" 
                            min="0" step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                            className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-orange-600 focus:ring-0 px-2 py-1 text-sm text-slate-800 text-right transition-all" 
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-orange-700">
                          {lineTotal}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50" 
                            title="Șterge articolul"
                            disabled={items.length === 1}
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
              <button 
                onClick={handleAddItem}
                className="flex items-center gap-2 text-orange-600 font-body text-sm font-semibold hover:bg-orange-50 px-4 py-2 rounded-md transition-colors w-max"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Adaugă produs
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <section className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4 text-orange-600">
              <span className="material-symbols-outlined text-[32px]">calculate</span>
            </div>
            <h3 className="font-body text-sm font-semibold text-slate-500 mb-1">Total Factură</h3>
            <p className="font-manrope text-4xl font-extrabold text-slate-900">
              {total.toFixed(2)} <span className="text-lg font-bold text-slate-400 ml-1">RON</span>
            </p>
            
            <div className="w-full h-px bg-slate-100 my-6"></div>
            
            <div className="w-full space-y-3 font-body text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Articole valide:</span>
                <span className="font-semibold text-slate-800">{items.filter(i => i.ingredient_id && i.quantity && i.unit_price).length}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>TVA estimat (11%):</span>
                <span className="font-semibold text-slate-800">{tvaEstimat.toFixed(2)} RON</span>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleSaveInvoice}
              className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white font-manrope font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] py-4 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              Salvează și Actualizează Stoc
            </button>
            <button 
              onClick={() => setView('list')}
              className="w-full bg-white text-orange-600 font-manrope font-bold text-sm rounded-lg border border-orange-200 hover:bg-orange-50 transition-all active:scale-[0.98] py-4"
            >
              Anulează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
