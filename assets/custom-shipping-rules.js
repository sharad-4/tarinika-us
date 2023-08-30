(function($) {
  const DATE_FORMAT = 'MM/DD/YYYY';
  const CURRENT_DATE = dayjs();

  function getCartFlags(cart) {
    var flag_mixed_items = false;
    var items_in_stock = cart.items.filter(function(item) {
      return item.properties && item.properties['_variant-status'] == 'in-stock';
    });
    var items_out_of_stock = cart.items.filter(function(item) {
      return item.properties && item.properties['_variant-status'] == 'out-of-stock';
    });
    flag_mixed_items = items_in_stock.length > 0 && items_out_of_stock.length > 0;
    
    var cart_has_out_of_stock_items = items_out_of_stock.length > 0;
    
    return {
      flag_mixed_items: flag_mixed_items,
      cart_has_out_of_stock_items: cart_has_out_of_stock_items
    };
  }
  
  function getETA(cart, selected_rate) {
    var process_time = SHIPPING_CONFIG.process_time;
    var transit_time = SHIPPING_CONFIG.transit_time;
    var eta_messages = [];
    var ships_by_date, deliver_by_date;

    var cart_flags = getCartFlags(cart);
    var flag_mixed_items = cart_flags.flag_mixed_items;
    var cart_has_out_of_stock_items = cart_flags.cart_has_out_of_stock_items;

    var stock_status = (cart_has_out_of_stock_items || flag_mixed_items) ? 'out_stock' : 'in_stock';
    var process_time = process_time[stock_status];
    
    console.log({stock_status, process_time, flag_mixed_items});

    if (!flag_mixed_items) {
      switch(selected_rate) {
        case SHIPPING_CONFIG.STANDARD_RATE_1:
        case SHIPPING_CONFIG.STANDARD_RATE_2:
          ships_by_date = CURRENT_DATE.add(process_time, 'days');
          deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');
          eta_messages.push('All items will ship in 7-10 business days');
          break;
          
        case SHIPPING_CONFIG.STANDARD_RATE_3:
          ships_by_date = CURRENT_DATE.add(process_time, 'days');
          deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');
          eta_messages.push('All items will ship in 7-10 business days');
          break;
      }
      
      // if (ships_by_date && deliver_by_date) {
      //   eta_messages.push('All items ship together and delivers by ' + deliver_by_date.format(DATE_FORMAT));
      // }
    }
    else {
      var pack_1_ships_by_date, pack_1_deliver_by_date;
      var pack_2_ships_by_date, pack_2_deliver_by_date;
      
      switch(selected_rate) {
        case SHIPPING_CONFIG.MIXED_RATE_1:
        case SHIPPING_CONFIG.MIXED_RATE_2:
          ships_by_date = CURRENT_DATE.add(process_time, 'days');
          deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');          
          // eta_messages.push('All items ship together and delivers by ' + deliver_by_date.format(DATE_FORMAT));
          eta_messages.push('All items will ship in 7-10 business days');
          break;
          
        case SHIPPING_CONFIG.MIXED_RATE_3:
          ships_by_date = CURRENT_DATE.add(process_time, 'days');
          deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');
          // eta_messages.push('All items ship together and delivers by ' + deliver_by_date.format(DATE_FORMAT));
          eta_messages.push('All items will ship in 7-10 business days');
          break;
          
        // case SHIPPING_CONFIG.MIXED_RATE_4:
        //   pack_1_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock, 'days');
        //   pack_1_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock + transit_time.standard, 'days');
        //   eta_messages.push('Ready to ship items delivers by ' + pack_1_deliver_by_date.format(DATE_FORMAT));
          
        //   pack_2_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock, 'days');
        //   pack_2_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock + transit_time.standard, 'days');          
        //   eta_messages.push('Other items delivers by ' + pack_2_deliver_by_date.format(DATE_FORMAT));
        //   break;
          
        // case SHIPPING_CONFIG.MIXED_RATE_5:
        //   pack_1_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock, 'days');
        //   pack_1_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock + transit_time.express, 'days');
        //   eta_messages.push('Ready to ship items delivers by ' + pack_1_deliver_by_date.format(DATE_FORMAT));
          
        //   pack_2_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock, 'days');
        //   pack_2_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock + transit_time.express, 'days');          
        //   eta_messages.push('Other items delivers by ' + pack_2_deliver_by_date.format(DATE_FORMAT));
        //   break;
      }      
    }
    //console.log({selected_rate, eta_messages});
    
    return eta_messages;
  }
  
  function CheckoutShippingProcessTimes () {
    $.getJSON('/cart.js').then(function(cart) {
      $('[data-shipping-methods] .radio-wrapper').each(function() {
        var $rate = $(this);
        var shipping_rate = $rate.find('[data-shipping-method-label-title]').attr('data-shipping-method-label-title');
        var eta_messages = getETA(cart, shipping_rate);
        
        //console.log(eta_messages);
        
        if ($rate.find('.shipping-eta').length == 0) {
          $rate.find('.radio__label').append('<div class="shipping-eta">' + eta_messages.map(function(msg) {return '<p>' +msg+ '</p>'}).join('') + '</div>');
        }
      });
    });
  }
  
  function CartShippingProcessTimes() {
    $('[data-shipping-title*="RATE"]').each(function() {
      var $rate = $(this);
      var rate = $rate.data('shipping-title');
      $rate.attr('data-shipping-title', SHIPPING_CONFIG[rate]);
    });
    
    $.getJSON('/cart.js').then(function(cart) {
      $('.cart-shipping-status li').each(function() {
        var $rate = $(this);
        var shipping_rate = $rate.attr('data-shipping-title');
        var eta_messages = getETA(cart, shipping_rate, 'cart');
        
        var cart_flags = getCartFlags(cart);
        var flag_mixed_items = cart_flags.flag_mixed_items;
        var cart_has_out_of_stock_items = cart_flags.cart_has_out_of_stock_items;
        
        if ($rate.find('.shipping-eta').length == 0) {
          $rate.append('<div class="shipping-eta">' + eta_messages.map(function(msg) {return '<p>' +msg+ '</p>'}).join('') + '</div>');          
        }
        
        $('.cart-shipping-status').addClass(flag_mixed_items ? 'mixed-items' : 'not-mixed-items');        
      });
    });
  }
  
  function ShippingProcessTimes() {
    CheckoutShippingProcessTimes();

    if (Shopify.Checkout && Shopify.Checkout.step == 'shipping_method') {
      var t = setInterval(function() {
        if ($('.shipping-eta').length == 0) {
          CheckoutShippingProcessTimes();
        }
        else {
          clearInterval(t);
        }
      }, 250);
    }
  }
  
  $(document).ready(function() {
    ShippingProcessTimes();
    // fallbacks if doesnt load on doc ready
    setTimeout(ShippingProcessTimes, 500);
    setTimeout(ShippingProcessTimes, 2000);
  });  
})(jQuery);