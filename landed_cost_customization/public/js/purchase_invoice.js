frappe.ui.form.on("Purchase Invoice", {

    supplier: function(frm) {

        if (!frm.doc.supplier) return;

        frappe.call({
            method: "landed_cost_customization.api.lcv.get_lcv_charges_by_supplier",
            args: {
                supplier: frm.doc.supplier
            },
            callback: function(r) {

                if (!r.message) return;

                frm.clear_table("items");

                r.message.forEach(function(d){

                    let row = frm.add_child("items");

                    row.item_code = d.item_code;
                    row.qty = d.qty;
                    row.rate = d.rate;
                    row.amount = d.rate * d.qty;

                    if(frm.fields_dict.items.grid.get_field("exchange_rate")){
                        row.exchange_rate = d.exchange_rate;
                    }

                });

                frm.refresh_field("items");

            }
        });

    }

});