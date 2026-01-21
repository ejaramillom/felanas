import PDFDocument from "pdfkit";
import fs from "fs";
import { Paycheck } from "../../entities/Paycheck.js";
import { PaycheckLineItem } from "../../entities/PaycheckLineItem.js";
import { MathUtils } from "../../utils/MathUtils.js";

export class PdfGenerator {
    /**
     * Generates a PDF for a given paycheck and returns it as a Buffer.
     */
    static async generatePaycheckPdf(paycheck: Paycheck): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            // Header
            doc.fontSize(20).text("PAYSLIP", { align: "center" });
            doc.moveDown();

            // Company Info (Placeholder - could be fetched from Paycheck.company)
            doc.fontSize(12).text("Felanas Store", { align: "left" });
            doc.moveDown();

            // Employee & Period Info
            doc.fontSize(10);
            doc.text(`Employee: ${paycheck.employee?.firstName} ${paycheck.employee?.lastName} (ID: ${paycheck.employeeId})`);
            doc.text(`Period: ${paycheck.period_start.toISOString().split('T')[0]} to ${paycheck.period_end.toISOString().split('T')[0]}`);
            doc.text(`Generated: ${paycheck.generatedAt.toISOString().split('T')[0]}`);
            doc.moveDown();

            // Line Items Table
            doc.text("Description", 50, doc.y, { width: 200, underline: true });
            doc.text("Type", 250, doc.y, { width: 100, underline: true });
            doc.text("Amount", 400, doc.y, { width: 100, align: "right", underline: true });
            doc.moveDown();

            let y = doc.y;
            if (paycheck.lineItems) {
                paycheck.lineItems.forEach((item: PaycheckLineItem) => {
                    doc.text(item.description, 50, y, { width: 200 });
                    doc.text(item.type, 250, y, { width: 100 });
                    doc.text(MathUtils.round(item.amount).toFixed(2), 400, y, { width: 100, align: "right" });
                    y += 15;
                });
            }

            doc.moveDown();
            doc.moveDown();

            // Totals
            doc.font("Helvetica-Bold");
            doc.text(`Gross Salary: ${MathUtils.round(paycheck.gross_salary).toFixed(2)}`, { align: "right" });
            doc.text(`Net Salary: ${MathUtils.round(paycheck.net_salary).toFixed(2)}`, { align: "right" });

            doc.end();
        });
    }
}
