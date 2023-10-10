(function () {
  var status_variant_msg = {};
  status_variant_msg['available'] = "Ships in 1-2 business days.";
  status_variant_msg['backlog_available'] = "Ships in 7-10 business days, other variants are ready to ship immediately";
  status_variant_msg['backlog'] = "Ships in 7-10 business days";

  function variantInventoryStatus() {
    function updateVariantStatus(variant, product) {
      var is_variant_available = variant.inventory_quantity > 0;
      var is_variant_backlog = variant.inventory_quantity <= 0 && variant.inventory_policy == 'continue';
      
      var product_available_variants = product.variants.filter(function(v) {
        return v.inventory_quantity > 0;
      });
      
      var product_has_available_variants = product_available_variants.length !== 0;
      var product_all_variants_backlog = !product_has_available_variants;
      
      var $product_form = $('#product_form_' + product.id);
      
      var $status = $product_form.find('.variant-stock-status');
      if (is_variant_available) {
        $status.text(status_variant_msg.available);
      }
      else if (is_variant_backlog && product_has_available_variants) {
        $status.text(status_variant_msg.backlog_available);
      }
      else if (product_all_variants_backlog) {
        $status.text(status_variant_msg.backlog);
      }
      
      //console.log($product_form);
      if ($product_form.find('#variant-status-prop').length == 0) {
        $product_form.append('<input type="hidden" id="variant-status-prop" name="properties[_variant-status]" />');
        
        $product_form.append('<input type="hidden" id="ship-status" name="properties[Status]" />');
      }
      
      var $variant_status_prop = $product_form.find('#variant-status-prop');
      $variant_status_prop.val(is_variant_available ? 'in-stock' : 'out-of-stock');
      
      var $ship_status = $product_form.find('#ship-status');
      $ship_status.val(is_variant_available ? 'Ready to Ship' : 'Ships in 7-10 business days');
    }
    
    // on variant change
    $(document).on('variant:change', function(e) {
      console.log(e);
      var variant = e.variant;
      var product = e.product;
      updateVariantStatus(variant, product);
    });
    
    // on page load
    if ($(".product_form ").length) {
      $(".product_form").each(function() {
        var $product = $(this);
        var product = $product.data('product');
        var variant = $product.data('selected-variant');
        updateVariantStatus(variant, product);
      });
    }    
  }
  
  $(document).ready(function() {
    //console.log('READY');
    variantInventoryStatus();
  });
})();