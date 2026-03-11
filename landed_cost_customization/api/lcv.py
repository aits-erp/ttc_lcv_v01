import frappe

@frappe.whitelist()
def get_unbilled_lcv_charges(supplier):
    """
    Return LCV Applicable Charges rows for this supplier
    that are from submitted LCV and not yet billed in any Purchase Invoice.
    """

    if not supplier:
        return []

    rows = frappe.db.sql("""
        SELECT
            ac.name AS child_row,
            ac.parent AS lcv,
            ac.custom_item AS item_code,
            ac.amount AS rate,
            ac.exchange_rate
        FROM
            `tabLanded Cost Taxes and Charges` ac
        INNER JOIN
            `tabLanded Cost Voucher` lcv
            ON lcv.name = ac.parent
        WHERE
            lcv.docstatus = 1
            AND ac.custom_supplier = %s
            AND IFNULL(ac.purchase_invoice, '') = ''
        ORDER BY lcv.posting_date
    """, (supplier,), as_dict=True)

    return rows


@frappe.whitelist()
def mark_lcv_rows_billed(rows, purchase_invoice):
    """
    After PI is saved/submitted, mark LCV child rows as billed
    to prevent duplicate billing.
    """
    if isinstance(rows, str):
        rows = frappe.parse_json(rows)

    for r in rows:
        frappe.db.set_value(
            "Landed Cost Taxes and Charges",
            r.get("child_row"),
            "purchase_invoice",
            purchase_invoice
        )

    frappe.db.commit()