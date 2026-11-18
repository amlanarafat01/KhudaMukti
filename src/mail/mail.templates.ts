export interface ClaimMailData {
  claimId: number;
  listingTitle: string;
  quantity: number;
  unit: string;
  pickupAddress: string;
  receiverName: string;
  donorName: string;
}

const wrap = (title: string, body: string) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:8px">
  <div style="background:#15803d;color:#fff;padding:14px 20px;border-radius:8px 8px 0 0;font-size:18px">KhudaMukti</div>
  <div style="padding:20px;color:#111827;line-height:1.5">
    <h3 style="margin-top:0">${title}</h3>${body}
    <p style="color:#6b7280;font-size:12px;margin-bottom:0">Thank you for fighting food waste.</p>
  </div>
</div>`;

const details = (d: ClaimMailData) => `
<table style="border-collapse:collapse">
  <tr><td style="padding:2px 12px 2px 0;color:#6b7280">Claim</td><td>#${d.claimId}</td></tr>
  <tr><td style="padding:2px 12px 2px 0;color:#6b7280">Food</td><td>${esc(d.listingTitle)}</td></tr>
  <tr><td style="padding:2px 12px 2px 0;color:#6b7280">Quantity</td><td>${d.quantity} ${esc(d.unit)}</td></tr>
  <tr><td style="padding:2px 12px 2px 0;color:#6b7280">Pickup</td><td>${esc(d.pickupAddress)}</td></tr>
</table>`;

// names and titles are user input, so escape them before putting them in HTML
function esc(s: string) {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(s).replace(/[&<>"']/g, (c) => map[c]);
}

export const receiverTemplate = (d: ClaimMailData) =>
  wrap(
    'Your claim is confirmed',
    `<p>Hello ${esc(d.receiverName)}, your claim was confirmed. A volunteer will be assigned to deliver it.</p>${details(d)}`,
  );

export const donorTemplate = (d: ClaimMailData) =>
  wrap(
    'Your food has been claimed',
    `<p>Hello ${esc(d.donorName)}, ${esc(d.receiverName)} claimed part of your listing. Please keep it ready for pickup.</p>${details(d)}`,
  );
