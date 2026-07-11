import { Plus, Download } from 'lucide-react';
import { Button } from '../ui';

interface ActionToolbarProps {
  addLabel: string;
  onAddClick: () => void;
  showExportExcel?: boolean;
  showExportPdf?: boolean;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isLoading?: boolean;
}

export function ActionToolbar({
  addLabel,
  onAddClick,
  showExportExcel = false,
  showExportPdf = false,
  onExportExcel,
  onExportPdf,
  isLoading = false,
}: ActionToolbarProps) {
  return (
    <div className="units-page__toolbar">
      <button
        type="button"
        className="units-page__btn-tambah"
        onClick={onAddClick}
        disabled={isLoading}
      >
        <Plus size={14} />
        {addLabel}
      </button>

      <div className="flex-1" />

      <div className="units-page__download-group">
        {showExportExcel && (
          <button
            type="button"
            className="units-page__btn-download units-page__btn-download--excel"
            onClick={onExportExcel}
            title="Download Excel"
            disabled={isLoading}
          >
            <Download size={14} />
            Excel
          </button>
        )}
        {showExportPdf && (
          <button
            type="button"
            className="units-page__btn-download units-page__btn-download--pdf"
            onClick={onExportPdf}
            title="Download PDF"
            disabled={isLoading}
          >
            <Download size={14} />
            PDF
          </button>
        )}
      </div>
    </div>
  );
}
