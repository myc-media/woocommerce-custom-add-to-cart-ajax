jQuery('document').ready(function($){
    $('.page-template-default').find($('li.product').each(function(){
        $(this).find('a.woocommerce-LoopProduct-link').addClass('ajaxModal');
        $(this).find('div.product-wrap a').addClass('ajaxModal');
    }));

	var pageTitle = $('.ModalRow.row > h1').text();
	var pageSubTitle = $('.ModalRow.row > p.addToCartText').text();

  var buttonURL, buttonID, thisButton, post_id;
  var productArray = [];

  /*******CLOSE AJAX BOX**********/

  $('.closeAjaxBox').on('click', function(e){
      var headingText = "<h1 style='text-align: center;'>" + pageTitle + "</h1><p class='addToCartText' style='text-align: center;'>" + pageSubTitle + "</p>";

      $('.ajaxColumn').removeClass('ajaxClass');
      $('.ModalRow.row').html(headingText);
      $(this).hide();
      $('button.ajaxButton').removeClass('showOnAJAX');
      $('button.ajaxButton').addClass('hideOnNoAJAX');
      $('.productSet .tabbed').show();
      $('.hideOnClick').show();
  });

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
          				if($('.ajaxColumnLink').length > 0 && checkExist){
                    /******************************
                    LOOP THROUGH ALL IMAGES ON THE LEFT AND RIGHT
                    AND ASSIGN THE SAME CLASSES TO BOTH OF THEM
                    ********************************/
          						$('img.attachment-woocommerce_thumbnail').each(function(index, val){
          							$(this).addClass('image-change'+index);
          						});

          						$('ul.tmcp-ul-wrap.tmcp-elements').each(function(index, val){
          							$(this).find('li label img').addClass('image-change'+index);
          						});

                      /**************
                      CHANGE IMAGE ON CLICK
                      ****************/

          						$('li.tmcp-field-wrap').on('click', function(){
                        var count;
          							var thisLi = $(this);
          							var imageChange = $(this).find('label img').attr('src');
          							var classToChange;

                        function syncSelect(list, index){
                          var isPreviousDiv = thisLi.closest('.cpf-type-radio').hasClass('syncSelect') ? true : false;
                          var isNextDiv = thisLi.closest('div.cpf-type-radio').hasClass('syncSelectBottom') ? true : false;
                          var previousDiv = thisLi.closest('.cpf-type-radio');
                          var nextDiv = thisLi.closest('.syncSelectBottom');

                          if(isPreviousDiv){
                            // console.log(previousDiv);
                            previousDiv.find('li.tmcp-field-wrap').each(function(i, val){
                              var stillExist = setInterval(function(){
                                if($('.tc-active').length){
                                  //STOP THE INTERVAL CHECK
                                  clearInterval(stillExist);
                                  if($(val).hasClass('tc-active')){
                                    count = i;
                                  }
                                  $('.syncSelectBottom').find('li.tmcp-field-wrap').each(function(i, val){
                                    if(i != count){
                                      $(val).removeClass('tc-active');
                                    } else {
                                      var changeImg = $(val).find('label img').attr('src');
                                      // console.log(changeImg);
                                      $(val).addClass('tc-active');
                                      var imgToChange = $('img.attachment-woocommerce_thumbnail')[index+1];
                                      $(imgToChange).fadeOut('fast', function(){
                                        $(imgToChange).attr('src', changeImg).fadeIn('fast');
                                        $(imgToChange).attr('srcset', changeImg).fadeIn('fast');
                                      });

                                    }
                                  });
                                }
                              }, 100);
                            });
                          } else {
                            // console.log(nextDiv);
                          }
                        }


          							$('li.tc-active').each(function(index){
          								classToChange = 'image-change'+index;
          								if($(thisLi).find('img').hasClass(classToChange)){
                            syncSelect(thisLi, index);
          									var imgToChange = $('img.attachment-woocommerce_thumbnail')[index];
                            $(imgToChange).fadeOut('fast', function(){
                              $(imgToChange).attr('src', imageChange).fadeIn('fast');
            									$(imgToChange).attr('srcset', imageChange).fadeIn('fast');
                            });
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


          // 						FOR DIV TO SCREENSHOT
          /*
          						$(function() {
          						    $("#btnSave").click(function() {
          						        html2canvas($("#widget"), {
          						            onrendered: function(canvas) {
          						                theCanvas = canvas;
          						                document.body.appendChild(canvas);

          						                canvas.toBlob(function(blob) {
          											saveAs(blob, "Dashboard.png");
          										});
          						            }
          						        });
          						    });
          						});
          */

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
       $('.cart-menu-wrap').addClass('has-products first-load');

      var productObj ={};
      var itemURL = thisButton.attr('href');
      var quantity = $('form input[name="quantity"]').val();
      var label, varQuantity, varImage, varPrice, varFinalPrice;

      /**********************************
      LOOP THROUGH ACTIVE/SELECTED OPTIONS
      **********************************/

      $('li.tmcp-field-wrap').each(function(index, value){
          productArray.push($(this));
          if($(this).hasClass('tc-active')){
              label = $(this).find('span.tc-label').text();
              varPrice = $(this).find('label input.tmcp-field.tm-epo-field').attr('data-rules').replace(/[\[\]"]+/g, '');
              // console.log(varPrice);
              // console.log(parseFloat(varPrice));
//                 varQuantity = $(this).find('input.tm-qty').val();
			        varQuantity = $(this).find('input.tm-qty').length ? $(this).find('input.tm-qty').val() : 1;

              varImage = $(this).find('label img').attr('src');
              varFinalPrice = $('.price.amount.final');
              productObj[index]={'label':label, 'price':varPrice, 'image': varImage, 'quantity': varQuantity};
          }
      });

//       console.log(productObj);

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
  });


});
