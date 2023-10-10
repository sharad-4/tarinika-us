$(document).ready(function() {
    ShippingProcessTimes();
    // fallbacks if doesnt load on doc ready
    setTimeout(ShippingProcessTimes, 500);
    setTimeout(ShippingProcessTimes, 2000);
}); 

const DATE_FORMAT = 'DD-MMM-YYYY';
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
   var cart_has_in_stock_items = items_in_stock.length > 0;
  
  return {
    flag_mixed_items: flag_mixed_items,
    cart_has_out_of_stock_items: cart_has_out_of_stock_items,
    cart_has_in_stock_items: cart_has_in_stock_items
  };
}

function addProductInCart() {
  var executed = false
  if(!executed) {
    $.getJSON('/cart.js').then(function(cart) {
      var product_variant_id = document.getElementsByClassName("product")[0].getAttribute('data-variant-id')
      var product_status = document.getElementsByClassName("product__description__property")[0].innerText
      var product_quantity = document.getElementsByClassName("product-thumbnail__quantity")[0].innerText
      var properties = {}
      if (product_status == "Status: Ready to Ship") {
          properties = {
              "_variant-status": "in-stock",
              "Status": "Ready to Ship"
          }
      } else {
          properties = {
              "_variant-status": "out-of-stock",
              "Status": "Ships in 7-10 business days"
          }
      }
      $.ajax({
          type: 'POST',
          url: '/cart/clear.js',
          dataType: 'json',
          success: function() {
            $.ajax({
              type: 'POST',
              url: '/cart/add.js',
              data: {
                quantity: parseInt(product_quantity),
                id: product_variant_id,
                properties: properties
              },
              dataType: 'json',
              success: function(data) {
                if(data) {
                  executed = true
                }
              }
          })
        }
      })
    });
  }
}

function getETA(cart, selected_rate) {
  var process_time = SHIPPING_CONFIG.process_time;
  var transit_time = SHIPPING_CONFIG.transit_time;
  var eta_messages = [];
  var ships_by_date, deliver_by_date;

  var cart_flags = getCartFlags(cart);
  var flag_mixed_items = cart_flags.flag_mixed_items;
  var cart_has_out_of_stock_items = cart_flags.cart_has_out_of_stock_items;
  var cart_has_in_stock_items = cart_flags.cart_has_in_stock_items;

  var stock_status = (cart_has_out_of_stock_items || flag_mixed_items) ? 'out_stock' : 'in_stock';
  var process_time = process_time[stock_status];
  
  //console.log({stock_status, process_time, flag_mixed_items});
  var cart_total_value = cart.original_total_price
  var cart_total_items = cart.item_count
  if (!cart_has_in_stock_items && !cart_has_out_of_stock_items) {
    var product_status = document.getElementsByClassName("product__description__property ")[0].innerText
    var product_price = document.getElementsByClassName("total-recap__final-price")[0].getAttribute('data-checkout-payment-due-target')
    cart_total_value = product_price
    if (product_status == "Status: Ready to Ship") {
      cart_has_in_stock_items = true
    } else {
      cart_has_out_of_stock_items = true
    }
  }
  let str_cart_value = cart_total_value.toString()
  str_cart_value = str_cart_value.slice(0, -2);
  var cart_value = parseInt(str_cart_value)

  // console.log(selected_rate, !flag_mixed_items, cart_value)
  
  if (!flag_mixed_items) {
    // if (cart_value <= 2000 && selected_rate === "Standard Shipment") {
    //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
    //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');
    //   if(cart_has_out_of_stock_items){
    //     eta_messages.push('All items will ship in 7-10 business days');
    //   }
    //   else if(cart_has_in_stock_items){
    //     eta_messages.push('All items will ship in 1-2 business days');
    //   }
    // }
    // if (cart_value > 2000 && selected_rate === "Free - Standard Shipment") {
    //   console.log("Free - ")
    //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
    //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');
    //   if(cart_has_out_of_stock_items){
    //     eta_messages.push('All items will ship in 7-10 business days');
    //   }
    //   else if(cart_has_in_stock_items){
    //     eta_messages.push('All items will ship in 1-2 business days');
    //   }
    // }
    // if (cart_value <= 10000 && selected_rate === "Cash On Delivery Charge") {
    //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
    //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');
    //   if(cart_has_out_of_stock_items){
    //     eta_messages.push('All items will ship in 7-10 business days');
    //   }
    //   else if(cart_has_in_stock_items){
    //     eta_messages.push('All items will ship in 1-2 business days');
    //   }
    // }

    switch(selected_rate) {
      case SHIPPING_CONFIG.STANDARD_RATE_2:
        ships_by_date = CURRENT_DATE.add(process_time, 'days');
        deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');
        if(cart_has_out_of_stock_items){
          eta_messages.push('All items will ship in 7-10 business days');
        }
        else if(cart_has_in_stock_items){
          eta_messages.push('All items will ship in 1-2 business days');
        }
        break;
      case SHIPPING_CONFIG.STANDARD_RATE_3:
        ships_by_date = CURRENT_DATE.add(process_time, 'days');
        deliver_by_date = CURRENT_DATE.add(process_time + transit_time.standard, 'days');
        if(cart_has_out_of_stock_items){
          eta_messages.push('All items will ship in 7-10 business days');
        }
        else if(cart_has_in_stock_items){
          eta_messages.push('All items will ship in 1-2 business days');
        }
        break;
      
        
      // case SHIPPING_CONFIG.STANDARD_RATE_3:
      //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
      //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');
      //   break;
    }

    if (cart_value > 10000) {
      const input_radios_1 = document.getElementsByClassName("radio__input")
      const radio0 = input_radios_1[0]
      const radio1 = input_radios_1[1]
      if (radio1) {
        radio1.getElementsByTagName("input")[0].checked = true
      } else {
        radio0.getElementsByTagName("input")[0].checked = true
      }
    }
   
    // if (ships_by_date && deliver_by_date) {
    //   //eta_messages.push('All items will ship together. Expected Delivery Date: <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('All items will ship in 1-2 business days');
    // }
  }
  else {
    var pack_1_ships_by_date, pack_1_deliver_by_date;
    var pack_2_ships_by_date, pack_2_deliver_by_date;
    // if (cart_value <= 2000 && selected_rate === "Standard Shipment") {
    //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
    //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');          
    //   //eta_messages.push('All items will ship together. Expected Delivery Date: <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('All items will ship together in 7-10  business days');
    // }
    // if (cart_value <= 2000 && selected_rate === "Split Shipment") {
    //   pack_1_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock, 'days');
    //   pack_1_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock + transit_time.standard, 'days');
    //   //eta_messages.push('<b>Ready to Ship Items</b> - Expected Delivery Date: <b>' + pack_1_deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('<b>Ready to Ship Items</b> will ship in 1-2  business days');
      
    //   pack_2_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock, 'days');
    //   pack_2_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock + transit_time.express, 'days');          
    //   //eta_messages.push('<b>Other Items</b> - Expected Delivery Date: <b>' + pack_2_deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('<b>Other Items</b> - will ship in 7-10  business days');
    // }
    // if (cart_value > 2000 && selected_rate === "Free - Standard Shipment") {
    //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
    //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');          
    //   //eta_messages.push('All items will ship together. Expected Delivery Date: <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('All items will ship together in 7-10  business days');
    // }
    // if (cart_value > 2000 && selected_rate === "Free - Split Shipment") {
    //   pack_1_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock, 'days');
    //   pack_1_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock + transit_time.standard, 'days');
    //   //eta_messages.push('<b>Ready to Ship Items</b> - Expected Delivery Date: <b>' + pack_1_deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('<b>Ready to Ship Items</b> will ship in 1-2  business days</b>');
      
    //   pack_2_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock, 'days');
    //   pack_2_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock + transit_time.standard, 'days');          
    //   //eta_messages.push('<b>Other Items</b> - Expected Delivery Date: <b>' + pack_2_deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('<b>Other Items</b> will ship in 7-10  business days</b>');
    // }
    // if (cart_value <= 10000 && selected_rate === "Cash On Delivery Charge") {
    //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
    //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');          
    //   //eta_messages.push('All items will ship together. Expected Delivery Date: <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
    //   eta_messages.push('All items will ship together in 7-10  business days');
    // }
    switch(selected_rate) {
      case SHIPPING_CONFIG.MIXED_RATE_1:
        ships_by_date = CURRENT_DATE.add(process_time, 'days');
        deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');          
        //eta_messages.push('All items will ship together. Expected Delivery Date: <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
        eta_messages.push('All items will ship together in 7-10  business days');
        break;
      case SHIPPING_CONFIG.MIXED_RATE_2:
        ships_by_date = CURRENT_DATE.add(process_time, 'days');
        deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');          
        //eta_messages.push('All items will ship together. Expected Delivery Date: <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
        eta_messages.push('All items will ship together in 7-10  business days');
        break;
        
      // case SHIPPING_CONFIG.MIXED_RATE_3:
      //   ships_by_date = CURRENT_DATE.add(process_time, 'days');
      //   deliver_by_date = CURRENT_DATE.add(process_time + transit_time.express, 'days');
      //   eta_messages.push('All items ship together and delivers by <b>' + deliver_by_date.format(DATE_FORMAT) + '</b>');
      //   break;
        
      case SHIPPING_CONFIG.MIXED_RATE_4:
        pack_1_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock, 'days');
        pack_1_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock + transit_time.standard, 'days');
        //eta_messages.push('<b>Ready to Ship Items</b> - Expected Delivery Date: <b>' + pack_1_deliver_by_date.format(DATE_FORMAT) + '</b>');
        eta_messages.push('<b>Ready to Ship Items</b> will ship in 1-2  business days');
        
        pack_2_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock, 'days');
        pack_2_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock + transit_time.express, 'days');          
        //eta_messages.push('<b>Other Items</b> - Expected Delivery Date: <b>' + pack_2_deliver_by_date.format(DATE_FORMAT) + '</b>');
        eta_messages.push('<b>Other Items</b> - will ship in 7-10  business days');
        break;
        
      case SHIPPING_CONFIG.MIXED_RATE_5:
        pack_1_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock, 'days');
        pack_1_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.in_stock + transit_time.standard, 'days');
        //eta_messages.push('<b>Ready to Ship Items</b> - Expected Delivery Date: <b>' + pack_1_deliver_by_date.format(DATE_FORMAT) + '</b>');
        eta_messages.push('<b>Ready to Ship Items</b> will ship in 1-2  business days</b>');
        
        pack_2_ships_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock, 'days');
        pack_2_deliver_by_date = CURRENT_DATE.add(SHIPPING_CONFIG.process_time.out_stock + transit_time.standard, 'days');          
        //eta_messages.push('<b>Other Items</b> - Expected Delivery Date: <b>' + pack_2_deliver_by_date.format(DATE_FORMAT) + '</b>');
        eta_messages.push('<b>Other Items</b> will ship in 7-10  business days</b>');
        break;
    }      
  }
  //console.log({selected_rate, eta_messages});


  if (cart_value > 10000) {
    const input_radios_1 = document.getElementsByClassName("radio__input")
    const radio0 = input_radios_1[0]
    radio0.getElementsByTagName("input")[0].checked = true
  }
  
  return eta_messages;
}

function CheckoutShippingProcessTimes () {
  $.getJSON('/cart.js').then(function(cart) {
    $('[data-shipping-methods] .radio-wrapper').each(function() {
      var $rate = $(this);
      var shipping_rate = $rate.find('[data-shipping-method-label-title]').attr('data-shipping-method-label-title');
      var eta_messages = getETA(cart, shipping_rate);
      
      // console.log(eta_messages);
      
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
      var eta_messages = getETA(cart, shipping_rate);
      
      var cart_flags = getCartFlags(cart);
      var flag_mixed_items = cart_flags.flag_mixed_items;
      var cart_has_out_of_stock_items = cart_flags.cart_has_out_of_stock_items;

      // console.log("Cart")
      
      if ($rate.find('.shipping-eta').length == 0) {
        $rate.append('<div class="shipping-eta">' + eta_messages.map(function(msg) {return '<p>' +msg+ '</p>'}).join('') + '</div>');          
      }
      
      $('.cart-shipping-status').addClass(flag_mixed_items ? 'mixed-items' : 'not-mixed-items');        
    });
  });
}

function ShippingProcessTimes() {
  $.getJSON('/cart.js').then(function(cart) {
    if(cart.item_count == 0) {
      addProductInCart();
    }
  });
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



