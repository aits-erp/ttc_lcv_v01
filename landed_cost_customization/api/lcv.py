import frappe


@frappe.whitelist()
def get_lcv_charges_by_supplier(supplier):

    if not supplier:
        return []

    data = frappe.db.sql("""
        SELECT
            ac.item,
            ac.amount,
            ac.exchange_rate,
            ac.description
        FROM
            `tabLanded Cost Voucher` lcv
        JOIN
            `tabLanded Cost Taxes and Charges` ac
            ON ac.parent = lcv.name
        WHERE
            lcv.docstatus = 1
            AND ac.supplier = %s
    """, (supplier,), as_dict=True)

    items = []

    for d in data:
        items.append({
            "item_code": d.item,
            "qty": 1,
            "rate": d.amount,
            "exchange_rate": d.exchange_rate,
            "description": d.description
        })

    return items


# Get LCV list based on supplier
@frappe.whitelist()
def get_lcv_list_by_supplier(supplier):

    data = frappe.db.sql("""
        SELECT DISTINCT lcv.name
        FROM `tabLanded Cost Voucher` lcv
        JOIN `tabLanded Cost Taxes and Charges` ac
            ON ac.parent = lcv.name
        WHERE
            lcv.docstatus = 1
            AND ac.supplier = %s
    """, (supplier,), as_dict=True)

    return data


# 🔹 THIS FUNCTION WAS MISSING
# Fetch charges from selected LCV
@frappe.whitelist()
def get_lcv_charges(lcv, supplier):

    if not lcv or not supplier:
        return []

    data = frappe.db.sql("""
        SELECT
            ac.name as child_row,
            ac.item,
            ac.amount,
            ac.exchange_rate,
            ac.description
        FROM
            `tabLanded Cost Taxes and Charges` ac
        WHERE
            ac.parent = %s
            AND ac.supplier = %s
    """, (lcv, supplier), as_dict=True)

    items = []

    for d in data:
        items.append({
            "item_code": d.item,
            "qty": 1,
            "rate": d.amount,
            "exchange_rate": d.exchange_rate,
            "description": d.description,
            "child_row": d.child_row
        })

    return items