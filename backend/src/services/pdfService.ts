const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

export interface CouponData {
  orderId: number;
  productName: string;
  productDescription: string;
  tokensSpent: number;
  productPrice: number;
  remainingPrice: number;
  moneyPaid?: number;
  customerName: string;
  purchaseDate: Date;
}

export const pdfService = {
  async generateCoupon(data: CouponData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', (err: any) => {
          console.error('PDFDocument error:', err);
          reject(err);
        });

        // Add logo at the top middle - 1/3 of page width
        const logoPath = path.join(__dirname, '../../assets/logo_develand.png');
        let currentY = 50;
        if (fs.existsSync(logoPath)) {
          const pageWidth = 595; // A4 width in points
          const logoWidth = pageWidth / 3; // 1/3 of page width
          const logoX = (pageWidth - logoWidth) / 2; // Center horizontally
          const logoHeight = 80; // Approximate logo height

          doc.image(logoPath, logoX, currentY, {
            width: logoWidth,
            align: 'center'
          });
          currentY += logoHeight + 20; // Move below logo with spacing
        }

        // Header with Develand branding - positioned below logo
        doc.y = currentY;
        doc
          .fontSize(28)
          .fillColor('#2563eb')
          .text('CUPÓN DE DESCUENTO', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(16)
          .fillColor('#1e40af')
          .text('Tokens Develand', { align: 'center' })
          .moveDown(2);

      // Order Information
      doc
        .fontSize(12)
        .fillColor('#374151')
        .text(`Cupón Nº: #${String(data.orderId).padStart(6, '0')}`, { align: 'right' })
        .text(`Fecha: ${data.purchaseDate.toLocaleDateString('es-ES')}`, { align: 'right' })
        .moveDown(2);

      // Customer Name
      doc
        .fontSize(14)
        .fillColor('#111827')
        .text(`Cliente: ${data.customerName}`, { align: 'left' })
        .moveDown(1.5);

      // Product Details Box
      const boxTop = doc.y;
      doc
        .rect(50, boxTop, 495, 150)
        .fillAndStroke('#eff6ff', '#2563eb');

      doc
        .fillColor('#1e40af')
        .fontSize(18)
        .text('PRODUCTO', 70, boxTop + 20)
        .moveDown(0.3);

      doc
        .fontSize(22)
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .text(data.productName, 70, doc.y)
        .font('Helvetica')
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#6b7280')
        .text(data.productDescription, 70, doc.y, { width: 450 });

      doc.y = boxTop + 160;
      doc.moveDown(2);

      // Financial Details
      const detailsY = doc.y;
      const actualMoneyPaid = data.moneyPaid !== undefined ? data.moneyPaid : data.remainingPrice;

      // Left column
      doc
        .fontSize(12)
        .fillColor('#374151')
        .text('Precio del Producto:', 70, detailsY)
        .moveDown(0.5)
        .text('Tokens Utilizados:', 70, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(16)
        .fillColor('#dc2626')
        .font('Helvetica-Bold')
        .text('Importe Restante a Pagar:', 70, doc.y + 10);

      // Right column (values)
      doc
        .fontSize(14)
        .fillColor('#111827')
        .font('Helvetica')
        .text(`€${data.productPrice.toFixed(2)}`, 350, detailsY, { align: 'right', width: 195 })
        .moveDown(0.3)
        .text(`${data.tokensSpent} tokens (€${data.tokensSpent.toFixed(2)})`, 350, doc.y, { align: 'right', width: 195 })
        .moveDown(0.5);

      // Show "Gratis" if money_paid is 0, otherwise show the amount
      const displayAmount = actualMoneyPaid === 0 ? 'Gratis' : `€${actualMoneyPaid.toFixed(2)}`;
      doc
        .fontSize(20)
        .fillColor(actualMoneyPaid === 0 ? '#16a34a' : '#dc2626')
        .font('Helvetica-Bold')
        .text(displayAmount, 350, doc.y + 8, { align: 'right', width: 195 });

      doc.moveDown(1.5);

      // Separator line
      doc
        .moveTo(70, doc.y)
        .lineTo(525, doc.y)
        .strokeColor('#d1d5db')
        .stroke();

      doc.moveDown(1);

      // Instructions
      doc
        .fontSize(11)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text('INSTRUCCIONES:', 70, doc.y)
        .moveDown(0.5)
        .fontSize(10)
        .text('1. Presente este cupón al momento de adquirir el producto.', 70, doc.y, { indent: 20 })
        .text('2. El importe restante deberá abonarse en efectivo o mediante otro método de pago.', 70, doc.y, { indent: 20 })
        .text('3. Este cupón no es reembolsable ni transferible.', 70, doc.y, { indent: 20 })
        .text('4. El cupón es válido hasta la finalización del programa.', 70, doc.y, { indent: 20 });

      doc.moveDown(3);

      // Footer
      doc
        .fontSize(9)
        .fillColor('#9ca3af')
        .text('www.develand.es | info@develand.es', { align: 'center' })
        .text('Sistema de Tokens Develand - Documento generado automáticamente', { align: 'center' });

      // Watermark
      doc
        .fontSize(60)
        .fillColor('#eff6ff', 0.3)
        .text('DEVELAND', 0, 400, { align: 'center' });

        doc.end();
      } catch (err: any) {
        console.error('Error creating PDF:', err);
        reject(err);
      }
    });
  },
};
