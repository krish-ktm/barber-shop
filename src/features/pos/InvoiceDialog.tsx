import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Copy, Download, Printer, Loader2, Percent, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Invoice, InvoiceProduct } from '@/api/services/invoiceService';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '@/hooks/useSettings';

// Cache for the company logo so we don’t re-encode it to base64 on every print
let cachedLogoDataUrl: string | null = null;

interface InvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Utility to load an image (from public folder) and convert to data URL for jsPDF
const loadImageAsDataUrl = (url: string): Promise<string> => {
  // Return cached copy if we already converted once
  if (cachedLogoDataUrl) {
    return Promise.resolve(cachedLogoDataUrl);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      ctx.drawImage(img, 0, 0);
      cachedLogoDataUrl = canvas.toDataURL('image/png');
      resolve(cachedLogoDataUrl);
    };
    img.onerror = (err) => reject(err as Error);
    img.src = url;
  });
};

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reference to the main invoice content for PDF/print capture
  const invoiceContentRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const getStatusBadge = (status: Invoice['status']) => {
    const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold border';
    switch (status) {
      case 'paid':
        return <span className={`${base} border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400`}>Paid</span>;
      case 'pending':
        return <span className={`${base} border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400`}>Pending</span>;
      case 'cancelled':
        return <span className={`${base} border-red-500 text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400`}>Cancelled</span>;
      default:
        return null;
    }
  };

  // Safe numeric values
  const discountAmount = invoice.discount_amount ?? 0;
  const tipAmount = invoice.tip_amount ?? 0;

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.id);
    toast({
      title: 'Copied to clipboard',
      description: `Invoice number ${invoice.id} has been copied.`,
    });
  };

  // Helper to build PDF using jsPDF + autoTable
  const generatePdf = async (autoPrint = false) => {
    // Show loader state
    if (autoPrint) setIsPrinting(true); else setIsDownloading(true);

    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const businessName = settings?.name || 'Barber Shop';
      doc.setProperties({ title: `Invoice ${invoice.id}`, author: businessName });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 40;
      let y = 40;

      // Load and draw company logo then header texts
      try {
        const logoData = await loadImageAsDataUrl('/logo/logo-tran.png');
        doc.addImage(logoData, 'PNG', marginX, y, 60, 60);
      } catch {
        // logo failed to load – continue without interruption
      }

      // Company name next to logo
      doc.setFontSize(18);
      doc.setFont('helvetica','bold');
      doc.setTextColor('#111827');
      doc.text(businessName, marginX + 70, y + 25);

      // Invoice Details subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica','normal');
      doc.text('Invoice Details', marginX + 70, y + 45);

      y += 70; // move below header block

      // Invoice number below header
      doc.setFontSize(10);
      doc.text(`Invoice #: ${invoice.id}`, marginX, y);
      y += 15;

      // Gray separator line
      doc.setDrawColor(210);
      doc.setLineWidth(0.5);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;

      // Status display right side
      doc.setFontSize(12);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - marginX - 80, y - 15);
      
      y += 15;

      // Dates & Meta
      doc.text(`Date: ${format(new Date(invoice.date), 'MMM d, yyyy')}`, marginX, y);
      if (invoice.appointment_id) {
        doc.text(`Appointment: #${invoice.appointment_id}`, marginX + 220, y);
      }
      y += 14;
      doc.text(`Payment: ${invoice.payment_method}`, marginX, y);
      y += 15;

      // Separator
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 15;

      // Customer & Staff
      doc.setFontSize(11);
      doc.text('Customer', marginX, y);    doc.text('Staff', pageWidth/2, y);
      y += 12;
      doc.setFontSize(10);
      doc.text(invoice.customer_name, marginX, y);  doc.text(invoice.staff_name, pageWidth/2, y);
      y += 10;

      doc.line(marginX, y, pageWidth - marginX, y);
      y += 15;

      // Services table
      const services = (invoice.invoiceServices || invoice.services || []).map((s)=>[
        s.service_name + (s.quantity>1? ` x${s.quantity}`:''),
        formatCurrency(s.total)
      ]);
      if(services.length){
        autoTable(doc,{
          startY:y,
          head:[['Service','Amount']],
          body:services,
          styles:{ fontSize:10, cellPadding:3 },
          headStyles:{ fillColor:[0,0,0], textColor:[255,255,255] },
          theme:'grid',
          margin:{ left:40, right:40 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Products table
      const products = (invoice.invoiceProducts || invoice.products || []).map((p)=>[
        p.product_name + (p.quantity>1? ` x${p.quantity}`:''),
        formatCurrency(p.total)
      ]);
      if(products.length){
        autoTable(doc,{
          startY:y,
          head:[['Product','Amount']],
          body:products,
          styles:{ fontSize:10, cellPadding:3 },
          headStyles:{ fillColor:[0,0,0], textColor:[255,255,255] },
          theme:'grid',
          margin:{ left:40, right:40 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Totals
      doc.setFontSize(12);
      doc.text('Summary', 40, y+10);
      y += 20;
      doc.setFontSize(10);
      const totals = [
        ['Subtotal', formatCurrency(invoice.subtotal)],
        ['Discount', formatCurrency(invoice.discount_amount ?? 0)],
        ['Tax', formatCurrency(invoice.tax_amount)],
        ['Tip', formatCurrency(invoice.tip_amount ?? 0)],
        ['Total', formatCurrency(invoice.total)]
      ];
      autoTable(doc,{
        startY:y,
        body:totals,
        theme:'plain',
        styles:{ fontSize:10, cellPadding:2 },
        columnStyles:{ 0:{cellWidth:100}, 1:{halign:'right'} },
        margin:{ left:40, right:40 },
      });

      // Notes
      if(invoice.notes){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Notes:', 40, y);
        y += 14;
        doc.text(doc.splitTextToSize(invoice.notes, pageWidth-80), 40, y);
      }

      if(autoPrint){
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.position='fixed'; iframe.style.left='-9999px';
        iframe.src=url; document.body.appendChild(iframe);
        iframe.onload=()=>{
          iframe.contentWindow?.focus(); iframe.contentWindow?.print();
          setTimeout(()=>{ document.body.removeChild(iframe); URL.revokeObjectURL(url); },1000);
        };
      } else {
        doc.save(`invoice_${invoice.id}.pdf`);
      }
    }catch(err){
      console.error('PDF error',err);
      toast({ title:'Error', description:'Failed to generate PDF', variant:'destructive' });
    }finally{
      setIsPrinting(false); setIsDownloading(false);
      if(!autoPrint){ toast({title:'Download started', description:'Your invoice PDF is downloading.'}); }
      else { toast({title:'Print dialog opened', description:'Generating printable view…'}); }
    }
  };

  const handlePrint = () => generatePdf(true);
  const handleDownload = () => generatePdf(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] flex flex-col w-[95vw] sm:w-auto sm:max-w-2xl rounded-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 mr-8">
            Invoice Details
            {getStatusBadge(invoice.status)}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div ref={invoiceContentRef} className="space-y-6">
            {/* Header Information */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">{invoice.id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyInvoiceNumber}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Date: {format(new Date(invoice.date), 'MMMM d, yyyy')}
              </div>
              {invoice.appointment_id && (
                <div className="text-sm text-muted-foreground">
                  Appointment: #{invoice.appointment_id}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Payment Method: {invoice.payment_method.charAt(0).toUpperCase() + invoice.payment_method.slice(1)}
              </div>
              {invoice.created_at && (
                <div className="text-sm text-muted-foreground">
                  Created: {format(new Date(invoice.created_at), 'MMMM d, yyyy, h:mm a')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Customer</h4>
                <div className="text-sm">{invoice.customer_name}</div>
              </div>

              {/* Staff Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Staff</h4>
                <div className="text-sm">{invoice.staff_name}</div>
              </div>
            </div>

            <Separator />

            {/* Services */}
            { (invoice.invoiceServices || invoice.services || []).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Services</h4>
              <div className="space-y-2">
                {(invoice.invoiceServices || invoice.services || []).map((service, index) => (
                  <div
                    key={`svc-${service.service_id}-${index}`}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <span>{service.service_name}</span>
                      {service.quantity > 1 && (
                        <span className="text-muted-foreground"> × {service.quantity}</span>
                      )}
                    </div>
                    <span>{formatCurrency(service.total)}</span>
                  </div>
                ))}
              </div>
            </div>) }

            {/* Products */}
            { (invoice.invoiceProducts || invoice.products || []).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Products</h4>
              <div className="space-y-2">
                {(invoice.invoiceProducts || invoice.products || []).map((product: InvoiceProduct, index: number) => (
                  <div
                    key={`prd-${product.product_id}-${index}`}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <span>{product.product_name}</span>
                      {product.quantity > 1 && (
                        <span className="text-muted-foreground"> × {product.quantity}</span>
                      )}
                    </div>
                    <span>{formatCurrency(product.total)}</span>
                  </div>
                ))}
              </div>
            </div>) }

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Percent className={`h-4 w-4 mr-1 ${discountAmount > 0 ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${discountAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    Discount
                    {invoice.discount_type === 'percentage' && invoice.discount_value
                      ? ` (${invoice.discount_value}%)`
                      : ''}
                  </span>
                </div>
                <span className={`text-sm ${discountAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : formatCurrency(0)}
                </span>
              </div>

              {/* Display individual tax components if available */}
              {invoice.tax_components && invoice.tax_components.length > 0 ? (
                invoice.tax_components.map((component, index) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{component.name} ({component.rate}%)</span>
                    <span>{formatCurrency(component.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({invoice.tax}%)</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className={`h-4 w-4 mr-1 ${tipAmount > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${tipAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    Tip
                  </span>
                </div>
                <span className={`text-sm ${tipAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {formatCurrency(tipAmount || 0)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              
              {/* Percentage indicators for tip and discount */}
              {(tipAmount > 0 || discountAmount > 0) && (
                <div className="text-xs text-muted-foreground space-y-1 mt-1">
                  {discountAmount > 0 && invoice.subtotal > 0 && (
                    <div className="flex justify-end">
                      Discount: {((discountAmount / invoice.subtotal) * 100).toFixed(1)}% of subtotal
                    </div>
                  )}
                  {tipAmount > 0 && invoice.total > 0 && (
                    <div className="flex justify-end">
                      Tip: {((tipAmount / invoice.total) * 100).toFixed(1)}% of total
                    </div>
                  )}
                </div>
              )}
            </div>

            {invoice.notes && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Notes: </span>
                {invoice.notes}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
            <Printer className="h-4 w-4 mr-2" />
            )}
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
            <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};