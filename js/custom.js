jQuery('document').ready(function($){
    $('.page-template').find($('li.product').each(function(){
        $(this).find('a.woocommerce-LoopProduct-link').addClass('ajaxModal');
        $(this).find('div.product-wrap a').addClass('ajaxModal');
    }));

    if($('.ajaxModal').closest($('.ajaxColumnLink')).length > 0){
        $('body').addClass('set');
    }

	var pageTitle = $('.ModalRow.row > h1').text();
	var pageSubTitle = $('.ModalRow.row > p.addToCartText').text();

  var buttonURL, buttonID, thisButton, post_id;
  var productArray = [];

  /**********REMOVE LINK FROM CHECKOUT PAGE TO PRODUCT ON THUMBNAIL****************/


  var checkoutExist = setInterval(function(){
    if($('#order_review').length){
      //STOP THE INTERVAL CHECK
      clearInterval(riserExist);
      $('.product-iamge a').removeAttr('href');
    }
  }, 100);

  /*********RISER CSS FOR COLUMN LINK********/

  var riserExist = setInterval(function(){

    if($('.riserLeft').length){
      //STOP THE INTERVAL CHECK
      clearInterval(riserExist);
      var riserLinkHeight = $('.riserLeft li.product.type-product').css('height');
      $('.riserLeft a.column-link.ajaxModal').height(riserLinkHeight);
      $('.riserRight a.column-link.ajaxModal').height(riserLinkHeight);
      $('.riserLeft a.column-link.ajaxModal').css('left', '10%');
      $('.riserRight a.column-link.ajaxModal').css('left', '-10%');
      $(window).on('resize', function(){
        riserLinkHeight = $('.riserLeft li.product.type-product').css('height');
        $('.riserLeft a.column-link.ajaxModal').height(riserLinkHeight);
        $('.riserRight a.column-link.ajaxModal').height(riserLinkHeight);
        $('.riserLeft a.column-link.ajaxModal').css('left', '10%');
        $('.riserRight a.column-link.ajaxModal').css('left', '-10%');
      });
    }
  }, 100);
  /*******CLOSE AJAX BOX**********/

    function closeAjaxBox(){
        var headingText = "<h1 style='text-align: center;'>" + pageTitle + "</h1><p class='addToCartText' style='text-align: center;'>" + pageSubTitle + "</p>";

        $('.ajaxColumn').removeClass('ajaxClass');
        $('.ModalRow.row').html(headingText);
        $(this).hide();
        $('button.ajaxButton').removeClass('showOnAJAX');
        $('button.ajaxButton').addClass('hideOnNoAJAX');
        $('.productSet .tabbed').show();
        $('.hideOnClick').show();
        $('.closeAjaxBox').hide();
    }

  $('.closeAjaxBox').on('click', function(e){
    closeAjaxBox();
  });

  $('ul.wpb_tabs_nav a').on('click', function(){
      closeAjaxBox();
  });


  /************HIDE SHIPPING ACCOUNT ON PICKUP CHOICE*************/
  // $(document).ready(function(){
  //       $('#checkout').change(function(){
  //           if($(this).find('input[checked]').val() == 'local_pickup:4'){
  //             $('span.select2-selection__clear').click();
  //             $('#wc_checkout_add_ons_18_field').hide('fast');
  //             $('#wc_checkout_add_ons_19_field').hide('fast');
  //           } else {
  //             $('#wc_checkout_add_ons_18_field').show('fast');
  //             $('#wc_checkout_add_ons_19_field').show('fast');
  //           }
  //       });
  //   });


  /***********AJAX MODAL SHOW************/

  //ADD ajaxModal class to colum link

  $('.ajaxColumnLink a.column-link').addClass('ajaxModal');

  //AJAX CLICK FUNCTION

  $('.ajaxModal').click(function(e){
      $('.ajaxColumn').addClass('ajaxClass');
      $('.closeAjaxBox').show();

      $('html, body').animate({
          scrollTop: $(".ajaxColumn").offset().top - 180
      }, 500);


      e.preventDefault();

      buttonURL = $(this).attr('href');
      buttonID = $(this).attr('id');
      thisButton = $(this);
      // console.log(thisButton);

      $.ajax({
          type: 'GET',
          url:  modalAjaxURL.ajaxurl,
          /***********AJAX MODAL DATA*********/
          data: {
              'post_url': buttonURL,
              'action': 'get_modal_content'
          },
          /************************
          AJAX SUCCESS FOR Modal
          ************************/
          success: function(result){
              // $('.modalTitle').html(result['post_title']);
              $('.ModalRow.row').html(result);

              $('section.related.products').remove();
              $('.product-sharing').remove();
              $('span.tm-epo-required').text('* Required');


              /*******FLEX BASIS FOR PRODUCTS********/
              var liCount;
              $('li.tmcp-field-wrap').each(function(index, value){
                liCount = index + 1;
              });
              // console.log(liCount);
              var flexBasis = 100/liCount;
              $('li.tmcp-field-wrap').css('flex-basis', flexBasis + '%');

              // post_id = result['post_id'];
              post_id = $('button.single_add_to_cart_button').attr('value');
              // console.log(post_id);

              $('.modalContent a').click(function(e){
                  e.preventDefault();
              });

              /**************SHOW ADD TO CART BUTTON*****************/

              $('button.ajaxButton').removeClass('hideOnNoAJAX');
              $('button.ajaxButton').addClass('showOnAJAX');
              $('button.ajaxButton').attr('value', post_id);
              $('.ModalRow').append('<div class="result"></div>');

              /*************LOOP THROUGH EPO OPTIONS AND DISPLAY**************/

              var tm_lazyload_container = $('.ModalRow');
              var loop_temp = function () {
                  var t = $( this );
                  if ( t.attr( 'data-mask' ) ) {
                      t.mask( t.attr( 'data-mask' ) );
                  }
              };
              var epo_selector = '.tc-extra-product-options';
              var product_id = tm_lazyload_container.find( epo_selector ).attr( "data-product-id" ),
                              epo_id = tm_lazyload_container.find( epo_selector ).attr( "data-epo-id" );

              $.tcepo.tm_init_epo( tm_lazyload_container, true, product_id, epo_id );
              $( window ).trigger( "tmlazy" );
              $( window ).trigger( 'tm_epo_loaded_quickview' );
              if ( $.jMaskGlobals ) {
                  tm_lazyload_container.find( $.jMaskGlobals.maskElements ).each( loop_temp );
              }
              $('.hideOnClick').hide();
              $('.productSet .tabbed').hide();


              /**********************
              ESSO SETS
              ***********************/
              //WAIT FOR ELEMENT TO LOAD
              var checkExist = setInterval(function(){
                if($('.tc-active').length){


                //STOP THE INTERVAL CHECK
                clearInterval(checkExist);

                //IF .ajaxColumnLink has content
        				if($('.ajaxColumnLink').length > 0 ){
                    /******************************
                    LOOP THROUGH ALL IMAGES ON THE LEFT AND RIGHT
                    AND ASSIGN THE SAME CLASSES TO BOTH OF THEM
                    ********************************/
                    $('.wpb_tabs_nav').on('click', function(){
                      if($("#tab-gas:visible").is(":visible")){
                        $('#tab-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-gray-diesel:visible").is(":visible")){
                        $('#tab-gray-diesel img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-diesel:visible").is(":visible")){
                        $('#tab-diesel img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-blue-gas:visible").is(":visible")){
                        $('#tab-blue-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-whiteblack-gas:visible").is(":visible")){
                        $('#tab-whiteblack-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-other-diesel:visible").is(":visible")){
                        $('#tab-other-diesel img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-white-gas:visible").is(":visible")){
                        $('#tab-white-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-other-gas:visible").is(":visible")){
                        $('#tab-other-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      } else if($("#tab-diesel-white:visible").is(":visible")){
                        $('#tab-diesel-white img.attachment-woocommerce_thumbnail').each(function(index, val){
                          $(this).removeClass('image-change'+index);
                        });
                      }
                    });
                    if($("#tab-gas:visible").is(":visible")){
                      $('#tab-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-diesel:visible").is(":visible")){
                      $('#tab-diesel img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-gray-diesel:visible").is(":visible")){
                      $('#tab-gray-diesel img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-blue-gas:visible").is(":visible")){
                      $('#tab-blue-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-whiteblack-gas:visible").is(":visible")){
                      $('#tab-whiteblack-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-other-diesel:visible").is(":visible")){
                      $('#tab-other-diesel img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-white-gas:visible").is(":visible")){
                      $('#tab-white-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-other-gas:visible").is(":visible")){
                      $('#tab-other-gas img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else if($("#tab-diesel-white:visible").is(":visible")){
                      $('#tab-diesel-white img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    } else {
                      $('img.attachment-woocommerce_thumbnail').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).addClass('image-change'+index);
          						});
                      $('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
                        $(this).removeClass('image-change'+index);
          							$(this).find('li label img').addClass('image-change'+index);
          						});
                    }

                  /**************
                  CHANGE IMAGE ON CLICK
                  ****************/

        					$('li.tmcp-field-wrap').on('click', function(){

                    var count;
        						var thisLi = $(this);
        						var imageChange = $(this).find('label img').attr('src');
        						var classToChange;

                    var checkActive = setInterval(function(){
                      if($('.tc-active').length){

                        clearInterval(checkActive);

                        var totalActive = $('.tc-active').length;
                      }
                    }, 100);

                    function syncSelect(list, index){
                      var previousDiv = list.closest('.cpf-type-radio');

                      if(list.closest('.cpf-type-radio').hasClass('syncSelect')){
                        // console.log(previousDiv);
                        previousDiv.find('li.tmcp-field-wrap').each(function(i, val){
                          var stillExist = setInterval(function(){
                            if($('.tc-active').length){
                              //STOP THE INTERVAL CHECK
                              clearInterval(stillExist);

                              if($(val).hasClass('tc-active')){
                                count = i;
                              }
                              previousDiv.nextAll('.syncSelectBottom').each(function(i, val){
                                $(this).find('li.tmcp-field-wrap').each(function(i, val){
                                  if(i != count){
                                    $(val).removeClass('tc-active');
                                  } else {
                                    $(val).addClass('tc-active');
                                  }
                                  if($("#tab-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-gas img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-diesel:visible").is(":visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-diesel img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-gray-diesel:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-gray-diesel img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-blue-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-blue-gas img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-whiteblack-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-whiteblack-gas img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-other-diesel:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-other-diesel img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-white-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")){
                                    var imgToChange = $('#tab-white-gas img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-other-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")){
                                    var imgToChange = $('#tab-other-gas img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else if($("#tab-diesel-white:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")){
                                    var imgToChange = $('#tab-diesel-white img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  } else {
                                    var imgToChange = $('img.attachment-woocommerce_thumbnail');
                                    for(var x = 0; x <= imgToChange.length; x++){
                                      if($(val).hasClass('tc-active')){
                                        $(val).find('label img').each(function(i, value){
                                            classToChange = 'image-change'+(x);
                                            var leftImg = $(imgToChange)[x];
                                            if($(value).hasClass(classToChange)){
                                              $(leftImg).fadeOut('fast', function(){
                                                $(leftImg).attr('src', $(value).attr('src')).fadeIn('fast');
                                                $(leftImg).attr('srcset', $(value).attr('src')).fadeIn('fast');
                                              });
                                            }
                                        });
                                      }
                                      else {
                                        var leftImg = $(imgToChange)[x];
                                        classToChange = 'image-change'+(x);
                                        if($(this).find('label img').hasClass(classToChange)){
                                          $(leftImg).fadeOut('fast', function(){
                                            $(leftImg).attr('src', "#").fadeIn('fast');
                                            $(leftImg).attr('srcset', "#").fadeIn('fast');
                                          });
                                        }
                                      }
                                    }
                                  }
                                });
                              });
                            }
                          }, 100);
                        });
                      }
                    }

                    /********************
                    CHANGE THIS SECTION TO CHECK BY ALL LI's
                    INSTEAD OF CHECKING BY ACTIVE LI's
                    SO WE CAN CHECK BY CLASS INSTEAD OF INDEX
                    **********************/
            				// $('li.tc-active').each(function(index){
                      $('li.tmcp-field-wrap').each(function(index, val){
            				    classToChange = 'image-change'+index;
                        if($(thisLi).find('img').hasClass(classToChange)){
                          // syncSelect(thisLi, index);

                          if($("#tab-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas-other:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")){
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-gas img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-diesel:visible").is(":visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-diesel img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-gray-diesel:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-gray-diesel img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-blue-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-blue-gas img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-whiteblack-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-whiteblack-gas img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-other-diesel:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-other-diesel img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-white-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-white-gas img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-other-gas:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-other-gas img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if($("#tab-diesel-white:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-gray-diesel:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible")) {
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){
                                  clearInterval(stillActive);

                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('#tab-diesel-white img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });
                          } else if(!$("#tab-gray-diesel:visible").is(":visible") && !$("#tab-diesel:visible").is("visible") && !$("#tab-gas:visible").is("visible") && !$("#tab-blue-gas:visible").is("visible") && !$("#tab-whiteblack-gas:visible").is("visible") && !$("#tab-other-diesel:visible").is("visible") && !$("#tab-white-gas:visible").is("visible") && !$("#tab-other-gas:visible").is("visible") && !$("#tab-diesel-white:visible").is("visible")){
                            syncSelect(thisLi, index);
                            $(thisLi).on('click', function(){
                              var stillActive = setInterval(function(){
                                if($('.tc-active').length){

                                  clearInterval(stillActive);


                                  if($(thisLi).hasClass('tc-active')){
                                    classToChange = 'image-change'+index;

                                    var imgToChange = $('img.attachment-woocommerce_thumbnail')[index];
                                    var imgSrc = $(thisLi).find('label img').attr('src');
                                    if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                                        $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                                      });
                                    }
                                  }
                                }
                              }, 100);
                            });



                            // var imgToChange = $('img.attachment-woocommerce_thumbnail')[index];
                            // var imgSrc = $(thisLi).find('label img').attr('src');
                            // if($(thisLi).find('label img').hasClass(classToChange) && $(imgToChange).hasClass(classToChange)){
                            //
                            //   $(imgToChange).fadeOut('fast', function(){
                            //     $(imgToChange).attr('src', imgSrc).fadeIn('fast');
                            //     $(imgToChange).attr('srcset', imgSrc).fadeIn('fast');
                            //   });
                            // }
                          }
                        }
                      });
                    });


                    /****************************
                    Hide Options with Only one Option
                    *****************************/

                    $('ul.tmcp-ul-wrap').each(function(index, val){
                      if($(this).find('li.tmcp-field-wrap').length <= 1){
                    // console.log('true');
                        $(this).closest('div.cpf-type-radio').css('display', 'none');
                        $(this).closest('div.cpf-type-radio').prev('.cpf-type-radio').css('width', 100 + '%');
                      }
                    });
                  }
                }
              }, 100);
          },
          /*************************
          AJAX MODAL BEFORE IT LOADS
          **************************/
          beforeSend: function(){
              $('.redLoader').show();
              $('.redLoader').addClass('loaderPosition');
              $('.ModalRow.row h1').text('Loading');
              $('.ModalRow.row p.addToCartText').text("");
          },
          /*************************
          AJAX MODAL AFTER IT LOADS
          **************************/
          complete: function(){
              $('.redLoader').hide();
              $('.redLoader').removeClass('loaderPosition');
              $('figure.woocommerce-product-gallery__wrapper > div > a').removeAttr('href');
              $('figure.woocommerce-product-gallery__wrapper > div > a').on('click', function(e){
                  e.preventDefault();
                  $(this).css('cursor', 'initial');
              });
              $('.tc-active').each(function(){
                $(this).addClass('activeTab');
              });
          },
          /*************************
          AJAX MODAL ERROR
          **************************/
          error: function(){
              alert('error');
          }
      });

  });


  /******************************
  AJAX BUTTON FOR ADD TO CART
  *******************************/
  $('button.ajaxButton').click(function(e){
      // e.preventDefault();
      if($('.tc-active').length>0){
        $('.cart-menu-wrap').addClass('has-products first-load');

        var productObj ={};
        var itemURL = thisButton.attr('href');
        var quantity = $('form input[name="quantity"]').val();
        var label, varQuantity, varImage, varPrice, finalPrice;
        var canvasImage;

        /**********************************
        LOOP THROUGH ACTIVE/SELECTED OPTIONS
        **********************************/
        var checkPrice = $('.tc-totals-form input.cpf-product-price').attr('value');
        var tempPrice = $('#tm-epo-totals span.price.amount.final').text().replace(/[\[\]"$,]+/g, '');
        finalPrice = tempPrice;
        $('.tc-totals-form input.cpf-product-price').attr('value', finalPrice);
        $('li.tmcp-field-wrap').each(function(index, value){
            // productArray.push($(this));
            if($(this).hasClass('tc-active')){

                label = $(this).find('span.tc-label').text();

                varPrice = $(this).find('label input.tmcp-field.tm-epo-field').attr('data-rules').replace(/[\[\]",]+/g, '');

                varQuantity = $(this).find('input.tm-qty').length ? $(this).find('input.tm-qty').val() : 1;

                if($(this).find('label input.tmcp-field').attr('data-imagep')){
                  varImage = $(this).find('label input.tmcp-field').attr('data-imagep');
                } else {
                  varImage = $(this).find('label input.tmcp-field').attr('data-image');
                }

                // if(checkPrice > 100){
                    // varPrice = 0;
                    productObj[index]={'label':label, 'setPrice':finalPrice, 'price':varPrice, 'image': varImage, 'quantity': varQuantity};
                // } else {
                //     productObj[index]={'label':label, 'price':varPrice, 'image': varImage, 'quantity': varQuantity};
                // }
            }
        });

        /*******HTML2CANVAS***********/
        if($('.ajaxColumnLink').length > 0){
          var htmlCanvas = document.getElementsByClassName('ajaxColumnLink');
          var canvasVar;
          /********HTML2CANVAS************/
          html2canvas(htmlCanvas[0], {backgroundColor: null}).then(function(canvas) {
            // htmlCanvas[0].appendChild(canvas);
            // $('.ajaxColumnLink canvas').attr('id', 'canvasID');
            canvasVar = canvas.toDataURL("image/png");
            // console.log(canvasVar);
            $.ajax({
              type: 'POST',
              url: modalAjaxURL.ajaxurl,
              data: {
                'htmlImg' : canvasVar,
                'action' : 'htmlCanvas',
                'htmlImgName' : 'test'
              },
              success: function(result){
                canvasImage = result.replace('/home/myccom/public_html/mycgraphics', 'https://www.mycgraphics.com');


                /************************
                AJAX POST TO CART
                ************************/

                $.ajax({
                    type: 'POST',
                    url: modalAjaxURL.ajaxurl,
                    /************************
                    AJAX POST ADD TO CART DATA
                    ************************/
                    data: {
                        'button_id': post_id,
                        'action': 'add_to_cart',
                        'quantity' : quantity,
                        'productData' : productObj,
                        'canvasImage' : canvasImage

                    },
                    /************************
                    AJAX POST ADD TO CART SUCCESS
                    ************************/
                    success: function(results){
                        // console.log(results);
                        // console.log(result[1]['label']);
                        $('.cart-menu').html(results.count['a.cart-contents']);
                        $('.result').html(results);
                        // console.log(results);

                        /************************
                        AJAX MINI CART UPDATE
                        ************************/

                        $.ajax({
                            type: 'GET',
                            url: modalAjaxURL.ajaxurl,
                            /************************
                            AJAX MINI CART DATA
                            ************************/
                            data: {
                                'action': 'custom_mini_cart_update'
                            },
                            /************************
                            AJAX MINI CART SUCCESS
                            ************************/
                            success: function(response){

                                $('.widget_shopping_cart_content').html(response);
                            }
                        });

                    },
                    /************************************
                    AJAX POST ADD TO CART DATA BEFORE SEND
                    **************************************/
                    beforeSend: function(){
                        $('.redLoader').show();
                        $('.redLoader').addClass('loaderPosition');
                    },
                    /************************************
                    AJAX POST ADD TO CART DATA AFTER COMPLETE
                    **************************************/
                    complete: function(){
                        $('.redLoader').hide();
                        $('.redLoader').removeClass('loaderPosition');
                    },
                });
              },
              /************************************
              AJAX POST ADD TO CART DATA BEFORE SEND
              **************************************/
              beforeSend: function(){
                  $('.redLoader').show();
                  $('.redLoader').addClass('loaderPosition');
              },
              /************************************
              AJAX POST ADD TO CART DATA AFTER COMPLETE
              **************************************/
              complete: function(){
                  $('.redLoader').hide();
                  $('.redLoader').removeClass('loaderPosition');
              },
              error: function(){
                console.log('error');
              }
            });
          });

        } else {

          $.ajax({
              type: 'POST',
              url: modalAjaxURL.ajaxurl,
              /************************
              AJAX POST ADD TO CART DATA
              ************************/
              data: {
                  'button_id': post_id,
                  'action': 'add_to_cart',
                  'quantity' : quantity,
                  'productData' : productObj

              },
              /************************
              AJAX POST ADD TO CART SUCCESS
              ************************/
              success: function(results){
                  // console.log(results);
                  // console.log(result[1]['label']);
                  $('.cart-menu').html(results.count['a.cart-contents']);
                  $('.result').html(results);
                  // console.log(results);

                  /************************
                  AJAX MINI CART UPDATE
                  ************************/

                  $.ajax({
                      type: 'GET',
                      url: modalAjaxURL.ajaxurl,
                      /************************
                      AJAX MINI CART DATA
                      ************************/
                      data: {
                          'action': 'custom_mini_cart_update'
                      },
                      /************************
                      AJAX MINI CART SUCCESS
                      ************************/
                      success: function(response){

                          $('.widget_shopping_cart_content').html(response);
                      }
                  });

              },
              /************************************
              AJAX POST ADD TO CART DATA BEFORE SEND
              **************************************/
              beforeSend: function(){
                  $('.redLoader').show();
                  $('.redLoader').addClass('loaderPosition');
              },
              /************************************
              AJAX POST ADD TO CART DATA AFTER COMPLETE
              **************************************/
              complete: function(){
                  $('.redLoader').hide();
                  $('.redLoader').removeClass('loaderPosition');
              },
          });
        }
      } else {
        alert('Please select one or more parts to add to your cart');
      }
  }); // END ADD TO CART BUTTON CLICK
  

  /******PARTS QUANTITY UPDATE*****/

  
  $('body').on('click', '.updatePricingEdit', function(){
    // $(this).closest('p').next('.updatePricing').append('Test');
    var thisDiv = $(this);

    var title = $(this).closest('dd').prev('dt').text();
    var regTitle = title.replace(/[:]+/g, '');

    var rawId = thisDiv.closest('tr.woocommerce-cart-form__cart-item').find('.product-remove a').attr('href');
    var idTwo = rawId.replace(/(https:\/\/www.mycgraphics.com\/cart\/\?remove_item=)/g, "");
    var id = idTwo.replace(/&.*/g, "");

    // console.log(id);

    // (https://www.mycgraphics.com/cart/\?remove_item=)|&amp;_wpnonce=.+  ->REGEX

    var htmlDiv = thisDiv.closest('p').next('.updatePricing');

    var loadingImg = '<img src="/wp-content/uploads/2018/04/89-1.gif" />';

    var inputBox = htmlDiv.find('input');

    var inputVal;
    var num;
    var returnValue;

    $('.updatePricing').html('');

    function setQuantity(num){
      htmlDiv.find('input').val(num);
      htmlDiv.find('input').attr('val', num);
      inputVal = htmlDiv.find('input').val();
      // console.log(inputVal);
      return inputVal;
    }

    // console.log(regTitle);
    
    $.ajax({
      type: 'GET',
      url: modalAjaxURL.ajaxurl,
      data: {
          'action': 'parts_quantity_update',
          'partId': id,
          'title': regTitle
      },
      success: function(response){

              if(response['Quantity'] != null && response['Option'] == regTitle){
                  num = parseInt(response['Quantity']);
                  // console.log(num);

                  htmlDiv.html(`<input class="partQuantityUpdate" type="text" val="" /><span><i class="fa-plus"></i><i class="fa-minus"></i></span><a class="button" href="#">Update cart</a>`);

                  setQuantity(num);
                  returnValue = setQuantity(num);
              }

          $('.updatePricing span').on('click', '.fa-plus', function(){
            num += 1;
            
            setQuantity(num);
            
            returnValue = setQuantity(num);
            // console.log(returnValue);
            
          });
          $('.updatePricing span').on('click', '.fa-minus', function(){
            if(num >= 1 && inputVal >= 1){
              num -= 1;
              if(num > 0){
                setQuantity(num);
                returnValue = setQuantity(num);
                // console.log(returnValue);
              }
            }else {
              num = 1;
              setQuantity(num);
              returnValue = setQuantity(num);
              // console.log(returnValue);
            }
          });

          $('.updatePricing input').on('keypress keyup blur', function(event){
            // $(this).val($(this).val().replace(/^[0+\.][a-zA-z+\.]*$/g, ''));
            $(this).val($(this).val().replace(/(?:^0|[1-9][.]+|[a-zA-Z])/g, ''));
            if((event.which != 46 || $(this).val().indexOf('.') != -1 ) && (event.which < 48 || event.which > 57)){
              event.preventDefault();
            }
          });
          
          $(htmlDiv).find('a.button').on('click', function(e){
            e.preventDefault();
            // console.log('clicked');
            $.ajax({
              type: 'POST',
              url: modalAjaxURL.ajaxurl,
              data: {
                'action': 'parts_post_quantity_update',
                'partId': id,
                'partQuantity': returnValue,
                'title': regTitle
              },
              success: function(result){
                // console.log(result);
                $('.shop_table button.button').removeAttr('disabled');
                $('.shop_table button.button').trigger('click');
              },
              beforeSend: function(){
                $(htmlDiv).append(loadingImg);
              }
            });
          });
      },
      beforeSend: function(){
        $(htmlDiv).append(loadingImg);
      }
    });
  });


});
