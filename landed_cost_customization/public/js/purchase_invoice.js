frappe.ui.form.on("Purchase Invoice", {

    refresh(frm) {

        if (frm.doc.docstatus !== 0) return;

        frm.add_custom_button("Get Charges From LCV", function() {

            if (!frm.doc.supplier) {
                frappe.msgprint("Please select Supplier first");
                return;
            }

            frappe.call({
                method: "landed_cost_customization.api.lcv.get_unbilled_lcv_charges",
                args: {
                    supplier: frm.doc.supplier
                },
                callback: function(r) {

                    if (!r.message || r.message.length === 0) {
                        frappe.msgprint("No unbilled LCV charges found.");
                        return;
                    }

                    r.message.forEach(function(d) {

                        let row = frm.add_child("items");

                        row.item_code = d.item_code;
                        row.qty = 1;
                        row.rate = d.rate;
                        row.amount = d.rate;

                        if (frm.fields_dict.items.grid.get_field("exchange_rate")) {
                            row.exchange_rate = d.exchange_rate;
                        }

                        row.lcv_row_reference = d.child_row; // custom field in PI Item
                    });

                    frm.refresh_field("items");

                }
            });

        });

    },

    after_save(frm) {

        let rows = [];

        (frm.doc.items || []).forEach(function(i){
            if (i.lcv_row_reference) {
                rows.push({child_row: i.lcv_row_reference});
            }
        });

        if (rows.length > 0) {

            frappe.call({
                method: "landed_cost_customization.api.lcv.mark_lcv_rows_billed",
                args: {
                    rows: rows,
                    purchase_invoice: frm.doc.name
                }
            });

        }

    }

});