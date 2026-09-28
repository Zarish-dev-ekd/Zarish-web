'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_SIZE_CHART_ROWS, getDefaultSizeChartRows } from '@/lib/sizeChart';
import type { SizeChartConfig, SizeMeasurementRow, Size } from '@/lib/types';
import { IconRuler, IconTapeMeasure } from '@/components/icons';

interface ProductSizeChartEditorProps {
  value: SizeChartConfig;
  onChange: (config: SizeChartConfig) => void;
  availableSizes?: Size[];
}

export default function ProductSizeChartEditor({
  value,
  onChange,
  availableSizes = [],
}: ProductSizeChartEditorProps) {
  const [defaultRows, setDefaultRows] = useState<SizeMeasurementRow[]>(DEFAULT_SIZE_CHART_ROWS);
  const [unitPreview, setUnitPreview] = useState<'in' | 'cm'>('in');

  useEffect(() => {
    // Load default rows from helper / localStorage
    const resolved = getDefaultSizeChartRows();
    setDefaultRows(resolved);
  }, []);

  const isActive = value.is_active ?? true;
  const useDefault = value.use_default ?? true;
  const customRows = value.rows && value.rows.length > 0 ? value.rows : defaultRows;

  const handleToggleActive = (active: boolean) => {
    onChange({
      ...value,
      is_active: active,
    });
  };

  const handleToggleSource = (isDef: boolean) => {
    onChange({
      ...value,
      use_default: isDef,
      rows: isDef ? undefined : (value.rows && value.rows.length > 0 ? value.rows : JSON.parse(JSON.stringify(defaultRows))),
    });
  };

  const handleUpdateCustomRow = (index: number, field: keyof SizeMeasurementRow, val: any) => {
    const updated = [...customRows];
    updated[index] = {
      ...updated[index],
      [field]: field === 'size' ? val : parseFloat(val) || 0,
    };
    onChange({
      ...value,
      use_default: false,
      rows: updated,
    });
  };

  const handleAddRow = () => {
    const nextSizeName = availableSizes.find(
      (s) => !customRows.some((r) => r.size.toUpperCase() === s.name.toUpperCase())
    )?.name || 'Custom';

    const newRow: SizeMeasurementRow = {
      size: nextSizeName,
      bustIn: 32.0,
      lengthIn: 22.0,
    };

    onChange({
      ...value,
      use_default: false,
      rows: [...customRows, newRow],
    });
  };

  const handleDeleteRow = (index: number) => {
    if (customRows.length <= 1) {
      alert('Size chart must have at least one measurement row.');
      return;
    }
    const updated = customRows.filter((_, i) => i !== index);
    onChange({
      ...value,
      use_default: false,
      rows: updated,
    });
  };

  const handleResetToDefault = () => {
    if (confirm('Reset custom measurements to match the global default size chart?')) {
      onChange({
        ...value,
        use_default: false,
        rows: JSON.parse(JSON.stringify(defaultRows)),
      });
    }
  };

  const formatVal = (inches: number) => {
    if (unitPreview === 'cm') {
      return (inches * 2.54).toFixed(1);
    }
    return inches.toFixed(1);
  };

  return (
    <div className="bg-white border border-[#E8E0D5] rounded-2xl p-5 sm:p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E0D5]/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E2D5C7] flex items-center justify-center text-[#7B5B3A] shadow-xs">
            <IconRuler size={20} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-serif font-bold text-[#2C1D13] m-0">
                Size Chart & Measurement Settings
              </h3>
              <span className="text-[10px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-[#7B5B3A] border border-[#E2D5C7]">
                Storefront Guide
              </span>
            </div>
            <p className="text-xs text-[#7A6F66] mt-0.5 m-0">
              Control the size chart modal and measurement guide displayed to customers for this product
            </p>
          </div>
        </div>

        {/* Global Enable / Disable Toggle for Product */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-[#FAF8F5] px-3.5 py-1.5 rounded-lg border border-[#E8E0D5] hover:border-[#D6CEC5] transition-colors">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => handleToggleActive(e.target.checked)}
            className="w-4 h-4 rounded text-[#7B5B3A] focus:ring-[#7B5B3A] accent-[#7B5B3A] cursor-pointer"
          />
          <span className="text-xs font-bold text-[#2C1D13]">
            {isActive ? 'Size Chart Enabled' : 'Size Chart Disabled'}
          </span>
        </label>
      </div>

      {!isActive ? (
        <div className="bg-[#FAF8F5] border border-dashed border-[#D6CEC5] rounded-xl p-4 text-center text-xs text-[#7A6F66]">
          Size Chart modal is disabled for this product. The Size Guide button will be hidden on the storefront product page.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Source Selection Option (Default vs Custom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Global Default */}
            <div
              onClick={() => handleToggleSource(true)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                useDefault
                  ? 'border-[#7B5B3A] bg-[#FAF6F0]/70 shadow-xs'
                  : 'border-[#E8E0D5] bg-white hover:border-[#D6CEC5]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size_chart_mode"
                    checked={useDefault}
                    onChange={() => handleToggleSource(true)}
                    className="w-4 h-4 text-[#7B5B3A] accent-[#7B5B3A] cursor-pointer"
                  />
                  <strong className="text-xs sm:text-sm font-bold text-[#2C1D13]">
                    Use Default Size Chart
                  </strong>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#7B5B3A] border border-[#E2D5C7]">
                  Standard (95%)
                </span>
              </div>
              <p className="text-xs text-[#7A6F66] pl-6 m-0">
                Automatically uses the store-wide standard size chart managed in admin Sizes & Colors.
              </p>
            </div>

            {/* Option 2: Custom for this product */}
            <div
              onClick={() => handleToggleSource(false)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                !useDefault
                  ? 'border-[#7B5B3A] bg-[#FAF6F0]/70 shadow-xs'
                  : 'border-[#E8E0D5] bg-white hover:border-[#D6CEC5]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size_chart_mode"
                    checked={!useDefault}
                    onChange={() => handleToggleSource(false)}
                    className="w-4 h-4 text-[#7B5B3A] accent-[#7B5B3A] cursor-pointer"
                  />
                  <strong className="text-xs sm:text-sm font-bold text-[#2C1D13]">
                    Custom Size Chart
                  </strong>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#8B6338] border border-[#E8E0D5]">
                  Product Variation
                </span>
              </div>
              <p className="text-xs text-[#7A6F66] pl-6 m-0">
                Define custom measurements (Bust, Length, Waist, Hips) tailored specifically to this garment.
              </p>
            </div>
          </div>

          {/* Unit Toggle Preview */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-[#2C1D13]">
              {useDefault ? 'Global Default Values Preview:' : 'Custom Product Measurements (in inches):'}
            </span>
            <div className="inline-flex items-center bg-[#F4EFEA] p-0.5 rounded-full border border-[#E2D5C7]">
              <button
                type="button"
                onClick={() => setUnitPreview('in')}
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  unitPreview === 'in' ? 'bg-[#2C1D13] text-white shadow-xs' : 'text-[#7A6F66] hover:text-[#2C1D13]'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnitPreview('cm')}
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  unitPreview === 'cm' ? 'bg-[#2C1D13] text-white shadow-xs' : 'text-[#7A6F66] hover:text-[#2C1D13]'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Sizing Table */}
          {useDefault ? (
            /* Read-only preview of Default Size Chart */
            <div className="border border-[#E8E0D5] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8E0D5] text-[#6E6259] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-28">Size</th>
                    <th className="py-3 px-4">Bust ({unitPreview})</th>
                    <th className="py-3 px-4">Front Length ({unitPreview})</th>
                    <th className="py-3 px-4">Waist ({unitPreview})</th>
                    <th className="py-3 px-4">Hips ({unitPreview})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9E1] text-[#2C1D13]">
                  {defaultRows.map((row) => (
                    <tr key={row.size} className="hover:bg-[#FAF6F0]/60 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-[#2C1D13]">{row.size}</td>
                      <td className="py-2.5 px-4 font-mono font-medium">{formatVal(row.bustIn)}</td>
                      <td className="py-2.5 px-4 font-mono font-medium">{formatVal(row.lengthIn)}</td>
                      <td className="py-2.5 px-4 font-mono font-medium">{row.waistIn ? formatVal(row.waistIn) : '—'}</td>
                      <td className="py-2.5 px-4 font-mono font-medium">{row.hipsIn ? formatVal(row.hipsIn) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Editable Custom Size Chart Table */
            <div className="space-y-3">
              <div className="overflow-x-auto border border-[#E8E0D5] rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-sm min-w-[650px]">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8E0D5] text-[#6E6259] font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-32">Size Label</th>
                      <th className="py-3 px-4">Bust (in)</th>
                      <th className="py-3 px-4">Front Length (in)</th>
                      <th className="py-3 px-4">Waist (in)</th>
                      <th className="py-3 px-4">Hips (in)</th>
                      <th className="py-3 px-4 text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9E1] text-[#2C1D13]">
                    {customRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF6F0]/60 transition-colors">
                        <td className="py-2.5 px-4 align-middle">
                          <input
                            type="text"
                            value={row.size}
                            onChange={(e) => handleUpdateCustomRow(idx, 'size', e.target.value)}
                            className="w-24 h-9 px-3 text-xs font-bold text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs"
                            placeholder="e.g. S"
                          />
                        </td>
                        <td className="py-2.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={row.bustIn}
                              onChange={(e) => handleUpdateCustomRow(idx, 'bustIn', e.target.value)}
                              className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            {unitPreview === 'cm' && (
                              <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                ({(row.bustIn * 2.54).toFixed(1)}cm)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={row.lengthIn}
                              onChange={(e) => handleUpdateCustomRow(idx, 'lengthIn', e.target.value)}
                              className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            {unitPreview === 'cm' && (
                              <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                ({(row.lengthIn * 2.54).toFixed(1)}cm)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={row.waistIn ?? ''}
                              placeholder="Opt"
                              onChange={(e) => handleUpdateCustomRow(idx, 'waistIn', e.target.value)}
                              className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            {unitPreview === 'cm' && row.waistIn && (
                              <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                ({(row.waistIn * 2.54).toFixed(1)}cm)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={row.hipsIn ?? ''}
                              placeholder="Opt"
                              onChange={(e) => handleUpdateCustomRow(idx, 'hipsIn', e.target.value)}
                              className="w-24 h-9 px-3 text-xs font-mono font-medium text-[#2C1D13] bg-white border border-[#E8E0D5] rounded-lg focus:border-[#7B5B3A] focus:ring-2 focus:ring-[#7B5B3A]/15 outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            {unitPreview === 'cm' && row.hipsIn && (
                              <span className="text-[11px] text-[#7A6F66] font-mono whitespace-nowrap">
                                ({(row.hipsIn * 2.54).toFixed(1)}cm)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right align-middle">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#9E3E3E] bg-[#FDF2F2] border border-[#F8D7D7] hover:bg-[#FDE8E8] hover:text-[#B91C1C] transition-all cursor-pointer active:scale-95"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions row: Add Size Row + Reset to Default */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#7B5B3A] bg-white text-[#7B5B3A] hover:bg-[#FAF6F0] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <span>+ Add Size Row</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-[#7A6F66] hover:text-[#2C1D13] underline cursor-pointer"
                >
                  Reset / Copy from Default Size Chart
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

