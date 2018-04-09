<?php

/*
Plugin Name: MYC Custom Ajax Add to Cart
Plugin URI: https://mycgraphics.com
Description: Load product on custom page via Ajax and add to cart using Ajax
Version: 1.0
Author: Jimmy Ghelani
Author URI: https://jgdesigns.ca

*/

class MYCAjax{

    /********Load JS and register Ajax URL*******/

    public static function theme_js() {
        wp_enqueue_script( 'theme_js', plugin_dir_url(__FILE__) . '/js/custom.js', array( 'jquery' ), '1.0', true );
        wp_enqueue_style('plugin_style', plugin_dir_url(__FILE__) . '/css/style.css');
        wp_localize_script('theme_js', 'modalAjaxURL', array('ajaxurl'=>admin_url('admin-ajax.php')));
    }


    /*******Load Product Info Via Ajax on Page*******/


    public static function get_modal_content_func() {


        global $post;

        $postURL = $_GET['post_url'];
        $postID = url_to_postid($postURL);
        $product = get_product($postID);
        $buttonURL = "<a href='" . $product->add_to_cart_url() ."'>add to cart</a>";
        $thePost;



        if ($postID == 0){
            echo "Invalid Input";
            die();
        }

        $thispost = get_post($postID);

        if(!is_object($thispost)){
            echo 'There is no post with the ID' . $postID;
            die();
        }

        $the_query = new WP_query(array('p' => $postID, 'post_type' => 'product'));

        if ($the_query->have_posts()) : while ($the_query->have_posts()) : $the_query->the_post();
            get_template_part( 'woocommerce/content', 'single-product' );
            endwhile;
        else :
            echo "There were no posts found";
        endif;
        die();
    }



    /*******EPO LOAD INFO ON AJAX **********/

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

        /***********GET PRODUCT INFO AND SEND TO WORDPERSS AS META INFO***********/

        global $woocommerce;

            $product_id         = $_POST['button_id'];
            $quantity           = $_POST['quantity'];
            $passed_validation  = apply_filters( 'woocommerce_add_to_cart_validation', true, $product_id, $quantity );
            $product_status     = get_post_status( $product_id );
            $productData        = $_POST['productData'];

            $cart_item_meta = array();

            for($x = 0; $x <= count($productData)+1; $x++){
                $cart_item_meta["custom_data_{$x}"]['Option'] = $productData[$x]['label'];
                $cart_item_meta["custom_data_{$x}"]['Quantity'] = $productData[$x]['quantity'];
                $cart_item_meta["custom_data_{$x}"]['Price'] = $productData[$x]['price'];
                $cart_item_meta["custom_data_{$x}"]['Image'] = '<img src="'.$productData[$x]['image'].'"/>';
                $cart_item_meta["custom_data_{$x}"]['FinalPrice'] = $productData[$x]['price'] * $productData[$x]['quantity'];
            }



            /************ADD TO CART V2*********/

            if($woocommerce->cart->add_to_cart($product_id, $quantity, $variation_id="", $variation = "", $cart_item_meta)){
                $data= array('count'=>apply_filters('woocommerce_add_to_cart_fragments', array()));
                do_action('woocommerce_ajax_added_to_cart', $product_id);
            }
            $response = json_encode($data);
            header("Content-Type: application/json");
            echo $response;

            die();
    }



    /**********UPDATE MINI CART***********/

    public static function custom_mini_cart_update(){
        echo wc_get_template('cart/mini-cart.php');
    }





    /********GET CART INFO AFTER ADD TO CART BUTTON IS PRESSED********/

    public static function myc_get_cart_item_from_session($cart_item, $values){
        $countVar = 0;
        foreach($cart_item as $k => $v){
            if (strpos($k, 'custom_data_') !== false){
                $countVar += 1;
            }

        }

        for($x = 0; $x <= $countVar; $x++){
            if(isset($values["custom_data_{$x}"])){
                $cart_item["custom_data_{$x}"]['Option'] = $values["custom_data_{$x}"]['Option'];
                $cart_item["custom_data_{$x}"]['Quantity'] = $values["custom_data_{$x}"]['Quantity'];
                $cart_item["custom_data_{$x}"]['Price'] = $values["custom_data_{$x}"]['Price'];
                $cart_item["custom_data_{$x}"]['Image'] = $values["custom_data_{$x}"]['Image'];
            }
        }

        return $cart_item;

    }


    /*******ADD CUSTOM CALCULATIONS BEFORE CALCULATING TOTAL*********/


    public static function myc_before_calculate_totals($cart_object){

        $finalPrice;
        $product;
        foreach($cart_object->cart_contents as $key=>$value){

            foreach($value['tmpost_data']['productData'] as $k=>$v){

                $product += $v['price'] * $v['quantity'];
                $value['data']->set_price($product);

            }
            $product = 0;

        }
    }



    /********GET CUSTOM META INFO AND SET TEMPLATE FOR OUTPUT********/

    public static function myc_get_item_data($other_data, $cart_item){
        $countVar = 0;
        foreach($cart_item as $k => $v){
            if (strpos($k, 'custom_data_') !== false){
                $countVar += 1;
            }

        }

        for($x = 0; $x <= $countVar; $x++){
            if(isset($cart_item["custom_data_{$x}"]) && $cart_item["custom_data_{$x}"] && $cart_item["custom_data_{$x}"]['Option']!=null){
                $other_data[] = array(
                    'name' => $cart_item["custom_data_{$x}"]['Option'],
                    'value' =>  '<p>
                                <span class="cpf-img-on-cart">
                                '.$cart_item["custom_data_{$x}"]['Image'].'
                                '.$cart_item["custom_data_{$x}"]['Quantity'].'<small> x $'.$cart_item["custom_data_{$x}"]['Price'].' = $'.$cart_item["custom_data_{$x}"]['Quantity']*$cart_item["custom_data_{$x}"]['Price'].'</small>
                                </span>'
                );
            }
        }

        return $other_data;
    }



    /********ADD CUSTOM META INFO TO ORDER********/

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

add_action('wp_enqueue_scripts', array('MYCAjax', 'theme_js'));
add_action('wp_ajax_get_modal_content', array('MYCAjax','get_modal_content_func'));
add_action('wp_ajax_nopriv_get_modal_content', array('MYCAjax', 'get_modal_content_func'));
add_filter( 'wc_epo_is_quickview', array('MYCAjax', 'wc_epo_is_quickview'), 10, 1 );
add_action('wp_ajax_add_to_cart', array('MYCAjax', 'add_to_cart_func'));
add_action('wp_ajax_nopriv_add_to_cart', array('MYCAjax', 'add_to_cart_func'));
add_filter('wp_ajax_nopriv_custom_mini_cart_update', array('MYCAjax', 'custom_mini_cart_update'));
add_filter('wp_ajax_custom_mini_cart_update', array('MYCAjax', 'custom_mini_cart_update'));
add_action('woocommerce_get_cart_item_from_session', array('MYCAjax', 'myc_get_cart_item_from_session'), 10, 2);
add_action('woocommerce_before_calculate_totals', array('MYCAjax', 'myc_before_calculate_totals'));
add_filter('woocommerce_get_item_data', array('MYCAjax', 'myc_get_item_data'), 10, 2);
add_action('wc_add_order_item_meta', array('MYCAjax', 'myc_order_item_meta'), 10, 2);
?>
