import frappe

@frappe.whitelist()
def get_lcv_charges_by_supplier(supplier):

    if not supplier:
        return []

    data = frappe.db.sql("""
        SELECT
            ac.custom_item,
            ac.amount,
            ac.exchange_rate
        FROM
            `tabLanded Cost Voucher` lcv
        JOIN
            `tabLanded Cost Taxes and Charges` ac
            ON ac.parent = lcv.name
        WHERE
            lcv.docstatus = 1
            AND ac.custom_supplier = %s
    """, (supplier), as_dict=True)

    items = []

    for d in data:
        items.append({
            "item_code": d.custom_item,
            "qty": 1,
            "rate": d.amount,
            "exchange_rate": d.exchange_rate
        })

    return items