<?php

/*
Plugin Name: MYC Custom Ajax Add to Cart
Plugin URI: https://mycgraphics.com
Description: Load product on custom page via Ajax and add to cart using Ajax
Version: 1.0
Author: Jimmy Ghelani
Author URI: https://jgdesigns.ca

*/

// MAIN CLASS FOR AJAX ADD TO CART
class MYCAjax{

    /********Load JS, CSSand register Ajax URL*******/

    // ajaxURL is: modalAjaxURL.ajaxurl

    public static function theme_js() {
        wp_enqueue_script( 'theme_js', plugin_dir_url(__FILE__) . '/js/custom.js', array( 'jquery' ), '1.0', true );
        wp_enqueue_style('plugin_style', plugin_dir_url(__FILE__) . '/css/style.css');
        wp_localize_script('theme_js', 'modalAjaxURL', array('ajaxurl'=>admin_url('admin-ajax.php')));
    }

    //REDIRECT LOGGED OUT USERS

    public static function protect_pages(){
      global $post;
      if($post->ID == 1599 || $post->ID ==1597 || $post->ID ==1591 || $post->ID ==1458){
        if(! is_user_logged_in()){
          wp_redirect(home_url() . '/wp-admin');
        }
      }
    }


    /*******Load Product Info Via Ajax on Page*******/

    public static function get_modal_content_func() {

        /*********LOAD GLOBAL POST**********/

        global $post;

        /************************
        GET POST URL, SET POST ID,
        GET PRODUCT, GET BUTTON URL
        ***********************/

        $postURL = $_GET['post_url'];
        $postID = url_to_postid($postURL);
        $product = get_product($postID);
        $buttonURL = "<a href='" . $product->add_to_cart_url() ."'>add to cart</a>";
        $thePost;

        /*******************
        POST EXISTS VALIDATION
        *******************/

        if ($postID == 0){
            echo "Invalid Input";
            die();
        }

        /****************
        QUERY DB FOR PRODUCT
        ******************/

        $the_query = new WP_query(array('p' => $postID, 'post_type' => 'product'));

        if ($the_query->have_posts()) : while ($the_query->have_posts()) : $the_query->the_post();
            get_template_part( 'woocommerce/content', 'single-product' );
        endwhile;
        else :
            echo "There were no posts found";
        endif;
        die();
    }



    /*******LOAD EPO INFO ON AJAX **********/

    function wc_epo_is_quickview($qv){
        // this will disable only flatsome quickview
        $custom_view = ( isset( $_GET['action'] ) && ($_GET['action'] == 'get_modal_content') );
        if ($custom_view){
        $qv = TRUE;
        }
        return $qv;
    }


    /**ADD TO CART****/

    public static function add_to_cart_func() {

        /*********************CALL GLOBAL WOOCOMMERCE VAR****************************/

        global $woocommerce;

        /***********GET PRODUCT INFO AND SEND TO WORDPERSS AS META INFO***********/
        /************************************
        GET Product
        GET Quantity
        GET Produc Data
        GET count of total number of products sent through ajax
        SET Array of products & product info in cart_item_meta array
        SUBMIT To Cart
        *************************************/

        $product_id         = $_POST['button_id'];
        $quantity           = $_POST['quantity'];
        $productData        = $_POST['productData'];

        $cart_item_meta = array();

        //COUNT NUMBER OF PRODUCTS SENT THROUGH AJAX
        $count = 0;
        foreach($productData as $key=>$value){
          $count = $key;
        }

        //PRODUCT VALIDATION
        $passed_validation  = apply_filters( 'woocommerce_add_to_cart_validation', true, $product_id, $quantity );
        
        for($x = 0; $x <= $count; $x++){
            $cart_item_meta["custom_data_{$x}"]['Option'] = $productData[$x]['label'];
            $cart_item_meta["custom_data_{$x}"]['Quantity'] = $productData[$x]['quantity'];
            if(isset($productData[$x]['setPrice'])){
                $cart_item_meta["custom_data_{$x}"]['Price'] = 0;
            } else {
                    $cart_item_meta["custom_data_{$x}"]['Price'] = $productData[$x]['price'];
                }
            $cart_item_meta["custom_data_{$x}"]['Image'] = '<img src="'.$productData[$x]['image'].'"/>';
            $cart_item_meta["custom_data_{$x}"]['FinalPrice'] = $productData[$x]['price'] * $productData[$x]['quantity'];
        }

        /************ADD TO CART V2*********/
        if($woocommerce->cart->add_to_cart($product_id, $quantity, $variation_id="", $variation = "", $cart_item_meta)){
            //UPDATE CART QUANTITY AND FRAGMENTS
            $data = array('count'=>apply_filters('woocommerce_add_to_cart_fragments', array()));
            do_action('woocommerce_ajax_added_to_cart', $product_id);
        }

        /***********SEND RESPONSE VIA AJAX**************/

        $response = json_encode($data);
        header("Content-Type: application/json");
        echo $response;

        die();
    }



    /**********
    UPDATE MINI CART
    ***********/

    public static function custom_mini_cart_update(){
        echo wc_get_template('cart/mini-cart.php');
    }


    /***********************************************
    GET CART INFO AFTER ADD TO CART BUTTON IS PRESSED
    ************************************************/

    public static function myc_get_cart_item_from_session($cart_item, $values){

        /************GET NUMBER OF PRODUCTS SUBMITTED TO CART**************/

        $countVar = 0;
        foreach($cart_item as $k => $v){
            if (strpos($k, 'custom_data_') !== false){
                $countVar += 1;
            }

        }

        /*******LOOP THROUGH ARRAY OF PRODUCTS IN SESSION********/

        for($x = 0; $x <= $countVar; $x++){
            /****CHECK IF PRODUCT IS SET/EXISTS****/
            if(isset($values["custom_data_{$x}"])){
                /*******SET ARRAY OF OPTIONS SET TO CART********/
                $cart_item["custom_data_{$x}"]['Option'] = $values["custom_data_{$x}"]['Option'];
                $cart_item["custom_data_{$x}"]['Quantity'] = $values["custom_data_{$x}"]['Quantity'];
                $cart_item["custom_data_{$x}"]['Price'] = $values["custom_data_{$x}"]['Price'];
                $cart_item["custom_data_{$x}"]['Image'] = $values["custom_data_{$x}"]['Image'];
            }
        }

        /********RETURN CART ITEM*********/

        return $cart_item;
    }


    /*****************************
    ADD CUSTOM CALCULATIONS BEFORE CALCULATING TOTAL
    *******************************/


    public static function myc_before_calculate_totals($cart_object){

        /************************
        GET Product Price and Quantity before setting cart total
        Calculate Price by Multiplying Quantity and Price
        ************************/

        $finalPrice;
        $product;

        /********************
        Iterate through cart contents
        Iterate through Product Data
        Set price of product
        IMPORTANT -> Reset price counter to 0 to calculate properly
        **********************/
        // debug::print_r($cart_object);
        //ITERATE THROUGH PRODUCTS IN CART
        foreach($cart_object->cart_contents as $key=>$value){
            //ITERATE THROUGH PRODUCT DATA
            foreach($value['tmpost_data']['productData'] as $k=>$v){

                //CALCULATE PRICE
                if(isset($v['price']) && $v['price']>0){
                    $product += $v['price'] * $v['quantity'];
                    //SET PRICE
                    $value['data']->set_price($product);
                } else {
                    $product = $v['setPrice'];
                }
                // $product += $v['price'] * $v['quantity'];
                // //SET PRICE
                // $value['data']->set_price($product);

            }
            //RESET PRICE COUNTER TO 0
            $product = 0;

        }
    }



    /********************************************
    GET CUSTOM META INFO AND SET TEMPLATE FOR OUTPUT
    **********************************************/

    public static function myc_get_item_data($other_data, $cart_item){
        //COUNT NUMBER OF PRODUCTS IN CART
        $countVar = 0;
        foreach($cart_item as $k => $v){
            if (strpos($k, 'custom_data_') !== false){
                $countVar += 1;
            }

        }

        //LOOP THROUGH PRODUCTS
        for($x = 0; $x <= $countVar; $x++){
            //VALIDATE IF PRODUCT EXISTS AND OPTION IS NOT NULL
            if(isset($cart_item["custom_data_{$x}"]) && $cart_item["custom_data_{$x}"] && $cart_item["custom_data_{$x}"]['Option']!=null){
                //SET CUSTOM TEMPLATE OF OUTPUT
                $other_data[] = array(
                    //OUTPUT FIRST FIELD (PRODUCT NAME)
                    'name' => $cart_item["custom_data_{$x}"]['Option'],
                    //OUTPUT EVERYTHING ELSE AND SET IT TO THE VALUE of 'value' KEY
                    'value' =>  '<p>
                                <span class="cpf-img-on-cart">
                                '.$cart_item["custom_data_{$x}"]['Image'].'
                                '.$cart_item["custom_data_{$x}"]['Quantity'].'<small> x $'.$cart_item["custom_data_{$x}"]['Price'].' = $'.$cart_item["custom_data_{$x}"]['Quantity']*$cart_item["custom_data_{$x}"]['Price'].'</small>
                                </span>'
                );
            }
        }

        //RETURN PRODUCT TEMPLATE WITH PRODUCT OPTIONS PRINTED TO CART & MINI CART

        return $other_data;
    }



    /********ADD CUSTOM META INFO TO ORDER/CHECKOUT********/

    public static function myc_order_item_meta($item_meta, $cart_item){
        $countVar = 0;
        foreach($cart_item as $k => $v){
            if (strpos($k, 'custom_data_') !== false){
                $countVar += 1;
            }

        }

        for($x = 0; $x <= $countVar; $x++){
            if(isset($cart_item["custom_data_{$x}"]) && $cart_item["custom_data_{$x}"]){
                $item_meta->add('Options', 'Test');
            }
        }

    }



}

/***********REGISTER ACTIONS AND FILTERS***********/

//REDIRECT LOGGED OUT USERS
add_action('template_redirect', array('MYCAjax', 'protect_pages'));

//REGISTER SCRIPTS -> JS AND CSS
add_action('wp_enqueue_scripts', array('MYCAjax', 'theme_js'));

//LOAD EPO OPTIONS ON PAGE
add_filter( 'wc_epo_is_quickview', array('MYCAjax', 'wc_epo_is_quickview'), 10, 1 );

//SET AJAX CALLBACK FUNCTION FOR MODAL CONTENT
add_action('wp_ajax_get_modal_content', array('MYCAjax','get_modal_content_func'));
add_action('wp_ajax_nopriv_get_modal_content', array('MYCAjax', 'get_modal_content_func'));

//SET AJAX CALLBACK FUNCTION FOR ADD TO CART
add_action('wp_ajax_add_to_cart', array('MYCAjax', 'add_to_cart_func'));
add_action('wp_ajax_nopriv_add_to_cart', array('MYCAjax', 'add_to_cart_func'));

//SET AJAX CALLBACK FUNCTION FOR MINI CART ECHO
add_filter('wp_ajax_nopriv_custom_mini_cart_update', array('MYCAjax', 'custom_mini_cart_update'));
add_filter('wp_ajax_custom_mini_cart_update', array('MYCAjax', 'custom_mini_cart_update'));

//GET ITEM FROM SESSION
add_action('woocommerce_get_cart_item_from_session', array('MYCAjax', 'myc_get_cart_item_from_session'), 10, 2);

//CALCULATE OPTIONS AND PRICES BEFORE FINAL TOTAL CALCULATION
add_action('woocommerce_before_calculate_totals', array('MYCAjax', 'myc_before_calculate_totals'));

//GET ITEM INFO
add_filter('woocommerce_get_item_data', array('MYCAjax', 'myc_get_item_data'), 10, 2);

//ADD ITEM META INFO
add_action('wc_add_order_item_meta', array('MYCAjax', 'myc_order_item_meta'), 10, 2);


/***********
TESTING
*************/

add_filter( 'woocommerce_add_cart_item_data', 'aa_func_20170206100217', 10, 3 );

function aa_func_20170206100217( $cart_item_data, $product_id, $variation_id ) {

    return $cart_item_data;
}

add_filter( 'woocommerce_get_cart_item_from_session', function ( $cartItemData, $cartItemSessionData, $cartItemKey ) {

    // $cartItemData['selected_date_event'] = $cartItemSessionData['selected_date_event'];
    // return $cartItemData;
    return $cartItemData;

}, 10, 3 );

add_action( 'woocommerce_add_order_item_meta', function ( $itemId, $values, $key ) {
    global $woocommerce;
    global $wpdb;

    $countVar = 0;
    foreach($values as $k => $v){
        if (strpos($k, 'custom_data_') !== false){
            $countVar += 1;
        }

    }

    for($x = 0; $x <= $countVar; $x++){
    debug::print_r($values);
      wc_add_order_item_meta($itemId, "Part", $values["custom_data_{$x}"]['Option']);
      wc_add_order_item_meta($itemId, "Quantity", $values["custom_data_{$x}"]['Quantity']);
      wc_add_order_item_meta($itemId, "Price", $values["custom_data_{$x}"]['Price']);
      wc_add_order_item_meta($itemId, " ", $values["custom_data_{$x}"]['Image']);
    }
}, 10, 3 );

?>
