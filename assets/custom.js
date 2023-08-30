(function () {
  var status_variant_msg = {};
  status_variant_msg['available'] = "Ships in 1-2 business days.";
  status_variant_msg['backlog_available'] = "Ships in 7-10 business days. Other variants available to ship immediately.";
  status_variant_msg['backlog'] = "Ships in 7-10 business days.";

  function variantInventoryStatus() {
    function updateVariantStatus(variant, product) {

      if(!variant.inventory_quantity){
        var sVariants = JSON.parse(sessionStorage.getItem("variants")) || {}
        // variant.inventory_quantity = sVariants[variant.id]?.inventory_quantity;
        // variant.inventory_management = sVariants[variant.id]?.inventory_management;
        // variant.inventory_policy = sVariants[variant.id]?.inventory_policy;
      }
      var variantEl = document.getElementById("product-form-" + product.id);
      if(typeof variantEl === "object") {
        var variantData = JSON.parse(variantEl?.getAttribute("data-variant-inventory"));
        var thisVariant = variantData.find(function(vr){ return vr.id === variant.id})
        variant.inventory_quantity = thisVariant?.inventory_quantity;
        variant.inventory_management = thisVariant?.inventory_management;
        variant.inventory_policy = thisVariant?.inventory_policy;
      }
      
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

      $ship_status.val(is_variant_available ? 'Ready to Ship' : 'Ships in 7-10 days');
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
        // var sessionVariants = JSON.parse(sessionStorage.getItem("variants")) || {}
        // if(!Object.keys(sessionVariants).length){
        //   sessionStorage.setItem("variants", JSON.stringify(product.variants))
        // }
        // else{
        //   product.variants = sessionVariants
        // }
        var variant = product?.variants[0]
        updateVariantStatus(variant, product);
      });

      
    }   
  }
  
  $(document).ready(function() {
    console.log('READY');
    variantInventoryStatus();
   });

  window.addEventListener('unload', (event) => {
   // sessionStorage.clear()
  });
})();

window.addEventListener('load', function() {
    console.log("Window loaded")
    var variant = {}
    var thisVariant = {}
    var variants = {}
    var productEl = document.querySelector("[data-product-form]");
      if(typeof productEl === "object") {
        thisVariant = JSON.parse(productEl.getAttribute("data-selected-variant"))
        variants = JSON.parse(productEl?.getAttribute("data-variant-inventory"))
        variant.inventory_quantity = thisVariant?.inventory_quantity;
        variant.inventory_management = thisVariant?.inventory_management;
        variant.inventory_policy = thisVariant?.inventory_policy;
      }

     var is_variant_available = variant.inventory_quantity > 0;
     var is_variant_backlog = variant.inventory_quantity <= 0 && variant.inventory_policy == 'continue';
      
     var product_available_variants = variants.filter(function(v) {
        return v.inventory_quantity > 0;
      });
      
      var product_has_available_variants = Boolean(product_available_variants.length);
      var $product_form = productEl;
      var $status = $product_form.querySelector('.variant-stock-status');
      if (is_variant_available) {
        $status.innerText = "Ships in 1-2 business days.";
      }
      else if (is_variant_backlog && product_has_available_variants) {
        $status.innerText = "Ships in 7-10 business days. Other variants available to ship immediately.";
      }
      else if (!product_has_available_variants) {
        $status.innerText = "Ships in 7-10 business days.";
      }
})
 