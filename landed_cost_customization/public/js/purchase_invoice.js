frappe.ui.form.on("Purchase Invoice", {

    refresh(frm) {

        if (frm.doc.docstatus !== 0) return;

        frm.add_custom_button("Get Charges From LCV", function() {

            if (!frm.doc.supplier) {
                frappe.msgprint("Please select Supplier first");
                return;
            }

            // Fetch LCV list filtered by supplier
            frappe.call({
                method: "landed_cost_customization.api.lcv.get_lcv_list_by_supplier",
                args: {
                    supplier: frm.doc.supplier
                },
                callback: function(r) {

                    if (!r.message || r.message.length === 0) {
                        frappe.msgprint("No submitted LCV found for this supplier.");
                        return;
                    }

                    let options = r.message.map(d => d.name).join("\n");

                    frappe.prompt(
                        [
                            {
                                label: "Select Landed Cost Voucher",
                                fieldname: "lcv",
                                fieldtype: "Select",
                                options: options,
                                reqd: 1
                            }
                        ],
                        function(values) {

                            // store selected LCV
                            frm.set_value("custom_landed_cost_voucher", values.lcv);

                            // Fetch charges from selected LCV
                            frappe.call({
                                method: "landed_cost_customization.api.lcv.get_lcv_charges",
                                args: {
                                    lcv: values.lcv,
                                    supplier: frm.doc.supplier
                                },
                                callback: function(res) {

                                    if (!res.message || res.message.length === 0) {
                                        frappe.msgprint("No LCV charges found.");
                                        return;
                                    }

                                    // remove default empty row
                                    frm.clear_table("items");

                                    res.message.forEach(function(d){

                                        let row = frm.add_child("items");

                                        row.item_code = d.item_code;
                                        row.qty = d.qty;
                                        row.rate = d.rate;
                                        row.amount = d.rate * d.qty;
                                        row.description = d.description;

                                        if (frm.fields_dict.items.grid.get_field("exchange_rate")) {
                                            row.exchange_rate = d.exchange_rate;
                                        }

                                        row.lcv_row_reference = d.child_row;

                                    });

                                    frm.refresh_field("items");

                                }
                            });

                        },
                        "Select LCV",
                        "Fetch Charges"
                    );

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