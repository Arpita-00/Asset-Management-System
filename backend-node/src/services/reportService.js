const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const {
  Asset, MaintenanceRequest, Vendor, WarrantyTracking, DepreciationRecord, AssetCategory, Department, Employee,
} = require('../models');
const logger = require('../utils/logger');

/**
 * Report Service.
 */

// ─── Asset Reports ────────────────────────────────────────────────────────────

async function generateAssetReportPdf(status) {
  const assets = await fetchAssets(status);
  const headers = ['Asset Tag', 'Name', 'Category', 'Status', 'Department', 'Assigned To', 'Purchase Cost', 'Current Value'];
  const rows = assets.map(a => [
    a.assetTag,
    a.name,
    a.category?.name || '',
    a.status,
    a.department?.name || '',
    a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : '',
    a.purchaseCost ? `₹${parseFloat(a.purchaseCost).toLocaleString('en-IN')}` : '',
    a.currentValue ? `₹${parseFloat(a.currentValue).toLocaleString('en-IN')}` : '',
  ]);
  return generatePdf(`Asset Report — ${status || 'All'}`, headers, rows);
}

async function generateAssetReportExcel(status) {
  const assets = await fetchAssets(status);
  const headers = ['Asset Tag', 'Name', 'Category', 'Brand', 'Model', 'Serial No', 'Status', 'Department', 'Assigned To', 'Purchase Date', 'Purchase Cost', 'Current Value', 'Warranty Expiry'];
  const rows = assets.map(a => [
    a.assetTag, a.name, a.category?.name || '', a.brand || '', a.model || '',
    a.serialNumber || '', a.status, a.department?.name || '',
    a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : '',
    a.purchaseDate || '',
    a.purchaseCost ? parseFloat(a.purchaseCost) : '',
    a.currentValue ? parseFloat(a.currentValue) : '',
    a.warrantyExpiry || '',
  ]);
  return generateExcel('Assets', headers, rows);
}

// ─── Maintenance Reports ──────────────────────────────────────────────────────

async function generateMaintenanceReportPdf() {
  const list = await MaintenanceRequest.findAll({
    include: [{ model: Asset, as: 'asset', attributes: ['name', 'assetTag'] }],
    order: [['createdAt', 'DESC']],
  });
  const headers = ['Request #', 'Asset', 'Type', 'Priority', 'Status', 'Technician', 'Cost', 'Created'];
  const rows = list.map(m => [
    m.requestNumber, m.asset?.name || '', m.issueType || '', m.priority, m.status,
    m.assignedTechnician || '',
    m.actualCost ? `₹${parseFloat(m.actualCost).toLocaleString('en-IN')}` : '',
    m.createdAt ? m.createdAt.toISOString().split('T')[0] : '',
  ]);
  return generatePdf('Maintenance Report', headers, rows);
}

async function generateMaintenanceReportExcel() {
  const list = await MaintenanceRequest.findAll({
    include: [{ model: Asset, as: 'asset', attributes: ['name', 'assetTag'] }],
    order: [['createdAt', 'DESC']],
  });
  const headers = ['Request #', 'Asset Tag', 'Asset Name', 'Issue Type', 'Priority', 'Status', 'Technician', 'Estimated Cost', 'Actual Cost', 'Created Date'];
  const rows = list.map(m => [
    m.requestNumber, m.asset?.assetTag || '', m.asset?.name || '', m.issueType || '',
    m.priority, m.status, m.assignedTechnician || '',
    m.estimatedCost ? parseFloat(m.estimatedCost) : '',
    m.actualCost ? parseFloat(m.actualCost) : '',
    m.createdAt ? m.createdAt.toISOString().split('T')[0] : '',
  ]);
  return generateExcel('Maintenance', headers, rows);
}

// ─── Warranty Reports ─────────────────────────────────────────────────────────

async function generateWarrantyReportPdf(days = 30) {
  const list = await fetchWarranties(days);
  const headers = ['Asset Tag', 'Asset Name', 'Warranty Type', 'Expiry Date', 'Days Left', 'Provider'];
  const today = new Date();
  const rows = list.map(w => {
    const daysLeft = w.expiryDate
      ? Math.ceil((new Date(w.expiryDate) - today) / (24 * 60 * 60 * 1000)) : 'N/A';
    return [w.asset?.assetTag || '', w.asset?.name || '', w.warrantyType || '', w.expiryDate || '', String(daysLeft), w.providerName || ''];
  });
  return generatePdf(`Warranty Expiry Report (next ${days} days)`, headers, rows);
}

async function generateWarrantyReportExcel(days = 30) {
  const list = await fetchWarranties(days);
  const headers = ['Asset Tag', 'Asset Name', 'Type', 'Start Date', 'Expiry Date', 'Days Left', 'Provider', 'Contract #'];
  const today = new Date();
  const rows = list.map(w => {
    const daysLeft = w.expiryDate
      ? Math.ceil((new Date(w.expiryDate) - today) / (24 * 60 * 60 * 1000)) : null;
    return [w.asset?.assetTag || '', w.asset?.name || '', w.warrantyType || '', w.startDate || '', w.expiryDate || '', daysLeft, w.providerName || '', w.contractNumber || ''];
  });
  return generateExcel('Warranties', headers, rows);
}

// ─── Depreciation Reports ─────────────────────────────────────────────────────

async function generateDepreciationReportPdf(financialYear) {
  const list = await fetchDepreciation(financialYear);
  const headers = ['Asset Tag', 'Asset Name', 'FY', 'Opening Value', 'Depreciation', 'Closing Value', 'Method'];
  const rows = list.map(d => [
    d.asset?.assetTag || '', d.asset?.name || '', d.financialYear,
    d.openingValue ? `₹${parseFloat(d.openingValue).toLocaleString('en-IN')}` : '',
    d.depreciationAmt ? `₹${parseFloat(d.depreciationAmt).toLocaleString('en-IN')}` : '',
    d.closingValue ? `₹${parseFloat(d.closingValue).toLocaleString('en-IN')}` : '',
    d.method || '',
  ]);
  return generatePdf(`Depreciation Report${financialYear ? ` — FY ${financialYear}` : ''}`, headers, rows);
}

async function generateDepreciationReportExcel(financialYear) {
  const list = await fetchDepreciation(financialYear);
  const headers = ['Asset Tag', 'Asset Name', 'FY', 'Opening Value', 'Rate (%)', 'Depreciation Amt', 'Closing Value', 'Method'];
  const rows = list.map(d => [
    d.asset?.assetTag || '', d.asset?.name || '', d.financialYear,
    d.openingValue ? parseFloat(d.openingValue) : '',
    d.depreciationRate ? parseFloat(d.depreciationRate) : '',
    d.depreciationAmt ? parseFloat(d.depreciationAmt) : '',
    d.closingValue ? parseFloat(d.closingValue) : '',
    d.method || '',
  ]);
  return generateExcel('Depreciation', headers, rows);
}

// ─── PDF Generator (PDFKit) ───────────────────────────────────────────────────

function generatePdf(title, headers, rows) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margins: { top: 40, left: 30, right: 30, bottom: 40 } });

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Colors
    const HEADER_COLOR = '#1e293b'; // slate-800
    const ACCENT_COLOR = '#6366f1'; // indigo-500
    const ALT_COLOR = '#f1f5f9';    // slate-100

    // Title
    doc.fillColor(HEADER_COLOR).fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`Generated: ${new Date().toDateString()}`, { align: 'center' });
    doc.moveDown(1);

    const pageWidth = doc.page.width - 60;
    const colWidth = pageWidth / headers.length;
    const rowHeight = 22;
    let y = doc.y;

    // Header row
    doc.rect(30, y, pageWidth, rowHeight).fill(ACCENT_COLOR);
    headers.forEach((h, i) => {
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
        .text(h, 30 + i * colWidth + 4, y + 6, { width: colWidth - 8, ellipsis: true });
    });
    y += rowHeight;

    // Data rows
    rows.forEach((row, ri) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 40;
      }

      const bg = ri % 2 === 1 ? ALT_COLOR : '#ffffff';
      doc.rect(30, y, pageWidth, rowHeight).fill(bg);

      row.forEach((cell, ci) => {
        doc.fillColor(HEADER_COLOR).fontSize(8).font('Helvetica')
          .text(String(cell ?? ''), 30 + ci * colWidth + 4, y + 7, { width: colWidth - 8, ellipsis: true });
      });

      y += rowHeight;
    });

    // Footer
    doc.moveDown(1);
    doc.fillColor('#94a3b8').fontSize(8).text(`Total records: ${rows.length}`, { align: 'right' });
    doc.end();
  });
}

// ─── Excel Generator (ExcelJS) ────────────────────────────────────────────────

async function generateExcel(sheetName, headers, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } },
    border: { bottom: { style: 'thin', color: { argb: 'FF4F46E5' } } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: false },
  };

  const altFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  sheet.addRow(headers).eachCell(cell => Object.assign(cell, headerStyle));
  sheet.getRow(1).height = 22;

  rows.forEach((row, i) => {
    const r = sheet.addRow(row);
    r.height = 18;
    if (i % 2 === 1) {
      r.eachCell(cell => { cell.fill = altFill; });
    }
  });

  // Auto-width columns
  sheet.columns.forEach((col, i) => {
    const maxLength = Math.max(
      headers[i].length,
      ...rows.map(r => String(r[i] ?? '').length)
    );
    col.width = Math.min(Math.max(maxLength + 4, 12), 40);
  });

  return workbook.xlsx.writeBuffer();
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchAssets(status) {
  const where = { isActive: true };
  if (status) where.status = status.toUpperCase();
  return Asset.findAll({
    where,
    include: [
      { model: AssetCategory, as: 'category', attributes: ['name'], required: false },
      { model: Department, as: 'department', attributes: ['name'], required: false },
      { model: Employee, as: 'assignedTo', attributes: ['firstName', 'lastName'], required: false },
    ],
    order: [['assetTag', 'ASC']],
  });
}

async function fetchWarranties(days) {
  const from = new Date().toISOString().split('T')[0];
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return WarrantyTracking.findAll({
    where: { expiryDate: { [Op.between]: [from, to] } },
    include: [{ model: Asset, as: 'asset', attributes: ['assetTag', 'name'] }],
    order: [['expiryDate', 'ASC']],
  });
}

async function fetchDepreciation(financialYear) {
  const where = financialYear ? { financialYear } : {};
  return DepreciationRecord.findAll({
    where,
    include: [{ model: Asset, as: 'asset', attributes: ['assetTag', 'name'] }],
    order: [['calculatedAt', 'DESC']],
  });
}

async function generateSingleAssetPdf(assetId) {
  const assetService = require('./assetService');
  const asset = await assetService.findByIdentifier(assetId);
  const identifier = asset.assetUniqueId || asset.assetTag;

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // PDF Style helper
    const drawDivider = (y) => {
      doc.moveTo(40, y).lineTo(570, y).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    };

    // Header Branding
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold').text('INDIAN RAILWAYS AMS', 40, 45);
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Asset Passport & Technical Specifications', 40, 65);
    doc.fillColor('#ef4444').font('Helvetica-Bold').fontSize(10).text('OFFICIAL VERIFIED', 460, 47, { align: 'right' });
    
    drawDivider(80);

    // Main Asset Box
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('1. GENERAL ASSET DETAILS', 40, 95);
    doc.font('Helvetica').fontSize(10).fillColor('#334155');

    let y = 115;
    const drawField = (label, val) => {
      doc.font('Helvetica-Bold').text(label + ':', 40, y, { width: 150 });
      doc.font('Helvetica').text(String(val ?? '—'), 180, y, { width: 380 });
      y += 18;
    };

    drawField('Asset Tag / Code', asset.assetTag);
    drawField('Secure Asset ID', identifier);
    drawField('Asset Name', asset.name);
    drawField('Category', asset.categoryName);
    drawField('Brand / Vendor', `${asset.brand || 'N/A'} / ${asset.vendorName || 'N/A'}`);
    drawField('Model Name', asset.model);
    drawField('Serial Number', asset.serialNumber);
    drawField('Current Status', asset.status);
    drawField('Deployment Location', asset.currentLocation);
    drawField('Owning Department', asset.departmentName);
    drawField('Assigned Employee', asset.assignedToName);

    drawDivider(y + 5);
    y += 20;

    // Technical / Specifications Box
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('2. TECHNICAL PARAMETERS', 40, y);
    y += 20;
    doc.font('Helvetica').fontSize(10).fillColor('#334155');

    drawField('Description', asset.description);
    
    if (asset.specifications) {
      try {
        const specs = typeof asset.specifications === 'string' ? JSON.parse(asset.specifications) : asset.specifications;
        if (specs && typeof specs === 'object') {
          Object.keys(specs).forEach(key => {
            drawField(key, specs[key]);
          });
        }
      } catch (e) {
        drawField('Specifications Raw', asset.specifications);
      }
    }

    drawDivider(y + 5);
    y += 20;

    // Financials & Warranty Box
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('3. VALUATION & WARRANTY DETAILS', 40, y);
    y += 20;
    doc.font('Helvetica').fontSize(10).fillColor('#334155');

    const formatINR = (val) => val ? `₹${parseFloat(val).toLocaleString('en-IN')}` : '—';
    const formatDateStr = (val) => val ? new Date(val).toLocaleDateString('en-GB') : '—';

    drawField('Original Cost', formatINR(asset.purchaseCost));
    drawField('Purchase Date', formatDateStr(asset.purchaseDate));
    drawField('Current Book Value', formatINR(asset.currentValue));
    drawField('Warranty Expiry Date', formatDateStr(asset.warrantyExpiry));
    drawField('Overall Health Score', `${asset.healthScore || 'N/A'} / 100 (${asset.healthLevel || 'N/A'})`);
    drawField('System Risk Category', asset.riskLevel || 'N/A');

    // Footer Info
    doc.fillColor('#94a3b8').fontSize(7).text(`Generated automatically by AMS Core on ${new Date().toLocaleString()}`, 40, 740);

    doc.end();
  });
}

module.exports = {
  generateAssetReportPdf, generateAssetReportExcel,
  generateMaintenanceReportPdf, generateMaintenanceReportExcel,
  generateWarrantyReportPdf, generateWarrantyReportExcel,
  generateDepreciationReportPdf, generateDepreciationReportExcel,
  generateSingleAssetPdf,
};
