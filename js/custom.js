jQuery('document').ready(function($){
    $('.page-template-default').find($('li.product').each(function(){
        // $(this).find('a.woocommerce-LoopProduct-link').removeAttr('href');
        $(this).find('a.woocommerce-LoopProduct-link').addClass('ajaxModal');
        // $(this).find('div.product-wrap a').removeAttr('href');
        $(this).find('div.product-wrap a').addClass('ajaxModal');
        // $(this).find('a').css('cursor', 'initial');
        // $(this).find('a').click(function(event){
        //     event.preventDefault();
        // });
        // $('a.yith-wcqv-button').css('cursor', 'pointer');
    }));

    var buttonURL, buttonID, thisButton, post_id;
    var productArray = [];


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
            data: {
                'post_url': buttonURL,
                'action': 'get_modal_content'
            },
            success: function(result){
                // $('.modalTitle').html(result['post_title']);
                $('.ModalRow.row').html(result);
                $('section.related.products').remove();
                $('.product-sharing').remove();

                // post_id = result['post_id'];
                post_id = $('button.single_add_to_cart_button').attr('value');
                // console.log(post_id);

                $('.modalContent a').click(function(e){
                    e.preventDefault();
                });

                $('button.ajaxButton').removeClass('hideOnNoAJAX');
                $('button.ajaxButton').addClass('showOnAJAX');
                $('button.ajaxButton').attr('value', post_id);
                $('.ModalRow').append('<div class="result"></div>');


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

            },
            beforeSend: function(){
                $('.redLoader').show();
                $('.redLoader').addClass('loaderPosition');
            },
            complete: function(){
                $('.redLoader').hide();
                $('.redLoader').removeClass('loaderPosition');
                $('figure.woocommerce-product-gallery__wrapper > div > a').removeAttr('href');
                $('figure.woocommerce-product-gallery__wrapper > div > a').on('click', function(e){
                    e.preventDefault();
                    $(this).css('cursor', 'initial');
                });
            },
            error: function(){
                alert('error');
            }
        });
    });

    $('.closeAjaxBox').on('click', function(e){
        $('.ajaxColumn').removeClass('ajaxClass');
        $('.ModalRow.row').html('<h1 style="text-align: center;">Please Click a Part</h1>');
        $(this).hide();
        $('button.ajaxButton').removeClass('showOnAJAX');
        $('button.ajaxButton').addClass('hideOnNoAJAX');
    })


    $('button.ajaxButton').click(function(e){
        // e.preventDefault();
         $('.cart-menu-wrap').addClass('has-products first-load');

        var productObj ={};

        var itemURL = thisButton.attr('href');

        var quantity = $('form input[name="quantity"]').val();

        var label, varQuantity, varImage, varPrice, varFinalPrice;


        $('li.tmcp-field-wrap').each(function(index, value){
            productArray.push($(this));
            if($(this).hasClass('tc-active')){
                label = $(this).find('span.tc-label').text();
                varPrice = $(this).find('label input.tmcp-field.tm-epo-field').attr('data-rules').replace(/\D/g, '');
                varQuantity = $(this).find('input.tm-qty').val();
                varImage = $(this).find('label img').attr('src');
                varFinalPrice = $('.price.amount.final');
                productObj[index]={'label':label, 'price':varPrice, 'image': varImage, 'quantity': varQuantity};
            }
        });
        // console.log(label);
        // console.log(varQuantity);
        // console.log(varImage);
        console.log(productObj);

        // $.ajax({
        //     type: 'POST',
        //     url: modalAjaxURL.ajaxurl,
        //     data: {
        //         'product_id' : post_id,
        //         'action': 'add_info_to_cart',
        //         'productData' : productObj
        //     },
        //     success: function(result){
        //         console.log($.parseJSON(result));

                // AJAX CALL

                $.ajax({
                    type: 'POST',
                    url: modalAjaxURL.ajaxurl,
                    data: {
                        'button_id': post_id,
                        'action': 'add_to_cart',
                        'quantity' : quantity,
                        'productData' : productObj

                    },
                    success: function(results){
                        console.log(results);
                        // console.log(result[1]['label']);
                        $('.cart-menu').html(results.count['a.cart-contents']);
                        $('.result').html(results);

                        // AJAX CALL

                        $.ajax({
                            type: 'GET',
                            url: modalAjaxURL.ajaxurl,
                            data: {
                                'action': 'custom_mini_cart_update'
                            },
                            success: function(response){

                                $('.widget_shopping_cart_content').html(response);
                            }
                        });

                    },
                    beforeSend: function(){
                        $('.redLoader').show();
                        $('.redLoader').addClass('loaderPosition');
                    },
                    complete: function(){
                        $('.redLoader').hide();
                        $('.redLoader').removeClass('loaderPosition');
                    },
                });
            // }
        // });
    });


});
