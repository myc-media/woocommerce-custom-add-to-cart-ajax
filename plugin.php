<?php

/*
Plugin Name: MYC Custom Ajax Add to Cart
Plugin URI: https://mycgraphics.com
Description: Load product on custom page via Ajax and add to cart using Ajax
Version: 1.0
Author: Jimmy Ghelani
Author URI: https://jgdesigns.ca

*/
add_action( 'wp_enqueue_scripts', 'enabling_date_picker' );
function enabling_date_picker() {

    // Only on front-end and checkout page
    if( is_admin() || ! is_checkout() ) return;

    // Load the datepicker jQuery-ui plugin script
    wp_enqueue_script( 'jquery-ui-datepicker' );
}

// MAIN CLASS FOR AJAX ADD TO CART
class MYCAjax{


    /********Load JS, CSSand register Ajax URL*******/

    // ajaxURL is: modalAjaxURL.ajaxurl

    public static function theme_js() {
        wp_enqueue_script( 'theme_js', plugin_dir_url(__FILE__) . '/js/custom.js', array( 'jquery' ), '1.0', true );
        wp_enqueue_style('plugin_style', plugin_dir_url(__FILE__) . '/css/style.css');
        wp_localize_script('theme_js', 'modalAjaxURL', array('ajaxurl'=>admin_url('admin-ajax.php')));
    }
    public static function htmlCanvas() {
        wp_enqueue_script( 'htmlCanvas', plugin_dir_url(__FILE__) . '/js/html2canvas.js', array(), '1.0', true );
    }

    //REDIRECT LOGGED OUT USERS

    public static function protect_pages(){
      global $post;
      if($post->ID == 1599 || $post->ID ==1597 || $post->ID ==1591 || $post->ID ==1458 || $post->ID ==1516 || $post->ID ==1315 || $post->ID ==1345 || $post->ID ==1344 || $post->ID ==1343){
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
        $canvasImage        = $_POST['canvasImage'];

        //PATH TO FILE: /home/myccom/public_html/mycgraphics/photos/1524712465.png
        // $canvasImage = str_replace('/home/myccom/public_html/mycgraphics', 'https://www.mycgraphics.com', $canvasImage);
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
                $cart_item_meta["custom_data_{$x}"]['setPrice'] = $productData[$x]['setPrice'];
                $cart_item_meta["custom_data_{$x}"]['Price'] = $productData[$x]['price'];
            $cart_item_meta["custom_data_{$x}"]['Image'] = '<img src="'.$productData[$x]['image'].'"/>';
        }
            $cart_item_meta['canvas'] = $canvasImage;

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

    public static function htmlCanvasFunc(){

      /*****************
      POST DATA
      'htmlImg' : canvasVar,
      'action' : 'htmlCanvas',
      'htmlImgName' : 'test'
      ***************/
      $htmlCanvas = $_POST['htmlImg'];
      $htmlCanvasName = $_POST['test'];

      $htmlImage = str_replace('data:image/png;base64,', '', $htmlCanvas);
      $htmlImage = str_replace(' ', '+', $htmlImage);
      $htmlImageDecoded = base64_decode($htmlImage);
      mkdir($_SERVER['DOCUMENT_ROOT']."/photos");
      $upload_dir = $_SERVER['DOCUMENT_ROOT']."/photos/";
      $file = $upload_dir . mktime() . '.png';

      $success = file_put_contents($file, $htmlImageDecoded);

      // function replace_product_image(){
      //   remove_action('woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail', 10);
      //   function wc_template_loop_product_replaced_thumb(){
      //     echo $file;
      //   }
      // }
      //
      // add_action('woocommerce_init', 'replace_product_image');
      // $response = json_encode($file);
      // header("Content-Type: application/json");
      // echo $response;
      echo $file;

      die();
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
                $cart_item["custom_data_{$x}"]['setPrice'] = $values["custom_data_{$x}"]['setPrice'];
                $cart_item["custom_data_{$x}"]['Price'] = $values["custom_data_{$x}"]['Price'];
                $cart_item["custom_data_{$x}"]['Image'] = $values["custom_data_{$x}"]['Image'];
                $cart_item['canvas'] = $values['canvas'];
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

        //ITERATE THROUGH PRODUCTS IN CART
        foreach($cart_object->cart_contents as $key=>$value){
            //ITERATE THROUGH PRODUCT DATA
            foreach($value['tmpost_data']['productData'] as $k=>$v){

                if($v['setPrice'] > 100){

                    $product = $v['setPrice'] / $value['quantity'];
                    //SET PRICE
                    $value['data']->set_price($product);

                } else if($v['setPrice'] > 100 and $v['price'] <1){
                  $product += ($v['price'] * $v['quantity']) + $v['setPrice'];
                  $value['data']->set_price($product);
                } else {
                  $product += ($v['price'] * $v['quantity']);
                  $value['data']->set_price($product);
                }

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
            if($cart_item["custom_data_${x}"]['Price'] > 0){
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
            } else {
              //SET CUSTOM TEMPLATE OF OUTPUT
              $other_data[] = array(
                  //OUTPUT FIRST FIELD (PRODUCT NAME)
                  'name' => $cart_item["custom_data_{$x}"]['Option'],
                  //OUTPUT EVERYTHING ELSE AND SET IT TO THE VALUE of 'value' KEY
                  'value' =>  '<p>
                              <span class="cpf-img-on-cart">
                              '.$cart_item["custom_data_{$x}"]['Image'].'
                              </span>'
              );
            }
          }
        }

        //RETURN PRODUCT TEMPLATE WITH PRODUCT OPTIONS PRINTED TO CART & MINI CART

        return $other_data;
    }

    public static function myc_add_order_item_meta( $itemId, $values, $key ) {
        global $woocommerce;
        global $wpdb;

        $countVar = 0;
        foreach($values as $k => $v){
            if (strpos($k, 'custom_data_') !== false){
                $countVar += 1;
            }

        }

        foreach($values['tmpost_data']['productData'] as $key => $value){

            $renderImage = "<img width='200' class='partImage' style='max-width: 200px;' src='" . $value['image'] . "' />";

            wc_add_order_item_meta($itemId, "Part", $value["label"]);
            // wc_add_order_item_meta($itemId, "Quantity", $value["quantity"]);
            // if(isset($valu['setPrice'])){
            //     wc_add_order_item_meta($itemId, "Price", $value["setPrice"]);
            // } else {
            //     wc_add_order_item_meta($itemId, "Price", $value["price"]);
            // }
            if(empty($values['canvas'])){
              wc_add_order_item_meta($itemId, "Quantity", $value['quantity']);
              wc_add_order_item_meta($itemId, "Price/Part", $value['price']);
              wc_add_order_item_meta($itemId, "Part-Image", $renderImage);
            }
            // wc_add_order_item_meta($itemId, " ", $renderImage);
        }
        if(!empty($values['canvas'])){
          $canvas = '<a class="showImage" href="'.$values['canvas'].'" target="_blank"><img width="200" src="'.$values['canvas'].'" /></a>';
          wc_add_order_item_meta($itemId, "Quantity", $value['quantity']);
          wc_add_order_item_meta($itemId, "Price/Set", $value['setPrice']);
          wc_add_order_item_meta($itemId, 'Set-Image', $canvas);
        }
        return $itemId;
    }

    /******REMOVE LINK FROM PRODUCT NAME ON ORDER DETAILS********/

    public static function myc_order_item_name( $name, $item, $order ) {
       $name = $item['name'];
       return $name;
    }

    public static function myc_email_order_items_table( $output, $order ) {

    	// set a flag so we don't recursively call this filter
    	static $run = 0;

    	// if we've already run this filter, bail out
    	if ( $run ) {
    		return $output;
    	}

      $args = array(
          'show_sku'      => true,
          'show_image'    => false,
          'image_size'    => array( 100, 100 ),
      );

    	// increment our flag so we don't run again
    	$run++;

    	// if first run, give WooComm our updated table
    	return $order->email_order_items_table( $args );
    }

    /**********CUSTOM CHECKOUT FORM FIELDS**************/
    public static function myc_before_checkout_form($checkout){

      date_default_timezone_set('America/New_York');
      $mydateoptions = array('' => __('Select Date', 'woocommerce'));

      echo '<div id="customer_po_field"><h2>' . __('Job Information') . '</h2>';

      echo '
     <script>
         jQuery(function($){
             $("#datepicker").datepicker();
             $("#pickup_datepicker").datepicker();
         });
     </script>';

      woocommerce_form_field('customer_install_name', array(
        'type'        => 'text',
        'class'       => array('my-field-class', 'form-row-wide'),
        'label'       => __('Customer Name', 'woocommerce'),
        'placeholder' => __('Enter name', 'woocommerce')
      ), $checkout->get_value('customer_install_name'));

      woocommerce_form_field('customer_install_address', array(
        'type'        => 'text',
        'class'       => array('my-field-class', 'form-row-wide'),
        'label'       => __('Location / Address', 'woocommerce'),
        'placeholder' => __('Enter Location / address', 'woocommerce')
      ), $checkout->get_value('customer_install_address'));

      woocommerce_form_field('job_number', array(
        'type'        => 'text',
        'class'       => array('my-field-class', 'form-row-wide'),
        'label'       => __('Job Number', 'woocommerce'),
        'placeholder' => __('Enter Job Number', 'woocommerce')
      ), $checkout->get_value('job_number'));

      woocommerce_form_field('customer_po_number', array(
        'type'        => 'text',
        'class'       => array('my-field-class', 'form-row-wide'),
        'label'       => __('PO Number', 'woocommerce'),
        'placeholder' => __('Enter PO Number', 'woocommerce')
      ), $checkout->get_value('customer_po_number'));

      woocommerce_form_field('pickup_date', array(
        'type'        => 'text',
        'class'       => array('my-field-class', 'form-row-wide'),
        'id'          => 'pickup_datepicker',
        'label'       => __('Pickup Date', 'woocommerce'),
        'placeholder' => __('Select Date'),
        'options'     => $mydateoptions
      ), $checkout->get_value('pickup_date'));

      woocommerce_form_field('install_date', array(
        'type'        => 'text',
        'class'       => array('my-field-class', 'form-row-wide'),
        'id'          => 'datepicker',
        'label'       => __('Install Date', 'woocommerce'),
        'placeholder' => __('Select Date'),
        'options'     => $mydateoptions
      ), $checkout->get_value('install_date'));

      echo '</div>';
    }


    public static function myc_checkout_update_order_meta($order_id, $posted){

      if (!empty($_POST['customer_install_name'])) {
        update_post_meta($order_id, '_customer_install_name', sanitize_text_field($_POST['customer_install_name']));
      }
      if (!empty($_POST['customer_install_address'])) {
        update_post_meta($order_id, '_customer_install_address', sanitize_text_field($_POST['customer_install_address']));
      }
      if (!empty($_POST['job_number'])) {
        update_post_meta($order_id, '_job_number', sanitize_text_field($_POST['job_number']));
      }
      if (!empty($_POST['customer_po_number'])) {
        update_post_meta($order_id, '_customer_po_number', sanitize_text_field($_POST['customer_po_number']));
      }
      if(!empty($_POST['pickup_date'])){
        update_post_meta($order_id, '_pickup_date', sanitize_text_field($_POST['pickup_date']));
      }
      if(!empty($_POST['install_date'])){
        update_post_meta($order_id, '_install_date', sanitize_text_field($_POST['install_date']));
      }
    }


    public static function myc_admin_order_data_after_billing_address($order){
      ?>
        <div class="order_data_column">
          <h4><?php _e('Extra Details', 'woocommerce'); ?></h4>
      <?
      echo '<p><strong>'.__('Customer Install Name').':</strong> ' . get_post_meta( $order->id, '_customer_install_name', true ) . '</p>';
      echo '<p><strong>'.__('Customer Install Address').':</strong> ' . get_post_meta( $order->id, '_customer_install_address', true ) . '</p>';
      echo '<p><strong>'.__('Customer Install Address 2').':</strong> ' . get_post_meta( $order->id, '_job_number', true ) . '</p>';
      echo '<p><strong>'.__('Customer PO Number').':</strong> ' . get_post_meta( $order->id, '_customer_po_number', true ) . '</p>';
      echo '<p><strong>'.__('Pickup Date').':</strong> ' . get_post_meta($order->id, '_pickup_date', true) . '</p>';
      echo '<p><strong>'.__('Install Date').':</strong> ' . get_post_meta($order->id, '_install_date', true) . '</p>';
      ?>
        </div>
      <?
    }


    public static function myc_checkout_update_user_meta($user_id){
      if($user_id && $_POST['customer_install_name']){
        update_user_meta($user_id, 'customer_install_name', sanitize_text_field($_POST['customer_install_name']));
      }
      if($user_id && $_POST['customer_install_address']){
        update_user_meta($user_id, 'customer_install_address', sanitize_text_field($_POST['customer_install_address']));
      }
      if($user_id && $_POST['job_number']){
        update_user_meta($user_id, 'job_number', sanitize_text_field($_POST['job_number']));
      }
      if($user_id && $_POST['customer_po_number']){
        update_user_meta($user_id, 'customer_po_number', sanitize_text_field($_POST['customer_po_number']));
      }
      if($user_id && $_POST['pickup_date']){
        update_user_meta($user_id, 'pickup_date', sanitize_text_field($_POST['pickup_date']));
      }
      if($user_id && $_POST['install_date']){
        update_user_meta($user_id, 'install_date', sanitize_text_field($_POST['install_date']));
      }
    }

    public static function myc_order_thank_you_pages($order){

	    	?>
		    	<div class="woocommerce-column woocommerce-column--1 woocommerce-column--billing-address col-1">


					<h2 class="woocommerce-column__title">Customer Install Info</h2>

					<table>
						<tbody>
							<tr>
								<td>Customer Install Name</td>
								<td><?php echo $order->get_meta('_customer_install_name'); ?></td>
							</tr>
							<tr>
								<td>Customer Address Line 1</td>
								<td><?php echo $order->get_meta('_customer_install_address'); ?></td>
							</tr>
							<tr>
								<td>Customer Address Line 2</td>
								<td><?php echo $order->get_meta('_job_number'); ?></td>
							</tr>
							<tr>
								<td>Customer PO</td>
								<td><?php echo $order->get_meta('_customer_po_number'); ?></td>
							</tr>
              <tr>
                <td>Pickup Date</td>
                <td><?php echo $order->get_meta('_pickup_date'); ?></td>
              </tr>
              <tr>
                <td>Install Date</td>
                <td><?php echo $order->get_meta('_install_date'); ?></td>
              </tr>
						</tbody>
					</table>


				</div>

		    <?php


    }

    public static function myc_email_order_meta_keys($keys){

      $keys['Customer Install Name'] = '_customer_install_name';
      $keys['Customer Address'] = '_customer_install_address';
      $keys['Customer Address Two'] = '_job_number';
      $keys['Customer PO'] = '_customer_po_number';
      $keys['Pickup Date'] = '_pickup_date';
      $keys['Install Date'] = '_install_date';
      return $keys;
    }


    public static function myc_user_list_tab_endpoint_register(){
      add_rewrite_endpoint('user-list', EP_ROOT | EP_PAGES);
    }

    public static function myc_query_vars($vars){
      $vars[] = 'user-list';
      return $vars;
    }

    public static function myc_woocommerce_account_menu_items($items){
      if(current_user_can('administrator') || current_user_can('supercustomer') || current_user_can('shop_manager') || current_user_can('pioneer_super_customer')){
        $items['user-list'] = 'Users';
        return $items;
      } else {
        if(isset($items['user-list'])){
          unset($items['user-list']);
        }
        return $items;
      }
    }

    public static function myc_redirect(){
      global $wp;
      if(current_user_can('administrator') || current_user_can('supercustomer') || current_user_can('pioneer_super_customer')){
        return;
      }
        $currentURL = trailingslashit(home_url($wp->request));
        $blocked_end_points = wc_get_endpoint_url('user-list');
        if($currentURL == $blocked_end_points){
          $myURL = wc_get_endpoint_url('my-account');
          wp_redirect($myURL);
          die;
        }
    }

    public static function myc_user_list_content(){
      echo '<h3>Users List</h3>';

      function pumpUsers($users){
        $userinfo;
        $companyInfo;
        ?>
        <table class="user-details-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Company</th>
              <?php
              if(current_user_can('supercustomer')){
                ?>
                <th class="essoCheck">Esso</th>
                <th class="mobilCheck">Mobil</th>
                <?php
              } else if(current_user_can('pioneer_super_customer')){
                  ?>
                    <th class="pioneerCheck">Pioneer</th>
                  <?php
              } else {
                ?>
                <th class="expiry">Expiry</th>
                <th class="essoCheck">Esso</th>
                <th class="mobilCheck">Mobil</th>
                <th class="pioneerCheck">Pioneer</th>
                <?php
              }
              ?>
            </tr>
          </thead>
          <tbody>
            <?php
              if(current_user_can('supercustomer')){
                foreach($users as $user){
                  $userinfo = get_user_meta($user->ID);
                  $companyInfo = $userinfo['company'][0];
                  if($user->caps['customer_on_account'] == 1 || $user->caps['customer']== 1 || $user->caps['mobile-customer-on-account']==1 || $user->caps['mobil_customer'] ==1){
                    ?>
                    <tr>
                      <td><?php echo $user->display_name; ?></td>
                      <td><?php echo $companyInfo; ?></td>
                      <td class="essoColumn">
                        <?php
                        if($user->caps['customer_on_account']==1 || $user->caps['customer']==1){
                        ?>
                        <span class="essoCheck">&#10003;</span>
                        <?php
                        } else if($user->caps['supercustomer'] == 1) {
                          ?>
                          <span class="essoCheck">&#9733;</span>
                          <?php
                        } else {

                        }
                        ?>
                      </td>
                      <td class="mobilColumn">
                        <?php
                        if($user->caps['mobile-customer-on-account']==1 || $user->caps['mobil_customer']==1){
                        ?>
                        <span class="mobilCheck">&#10003;</span>
                        <?php
                      } else if($user->caps['supercustomer'] == 1) {
                        ?>
                        <span class="essoCheck">&#9733;</span>
                        <?php
                      } else {

                      }
                      ?>
                      </td>
                    </tr>
                    <?php
                  }else {

                  }
                }
              } else if(current_user_can('pioneer_super_customer')){
                foreach($users as $user){
                  $userinfo = get_user_meta($user->ID);
                  $companyInfo = $userinfo['company'][0];
                  if($user->caps['pioneer_customer_on_account']==1 || $user->caps['pioneer_customer']==1){
                   ?>
                   <tr>
                     <td>
                       <?php
                           echo $user->display_name;
                       ?>
                     </td>
                     <td><?php echo $companyInfo; ?></td>
                     <td class="pioneerColumn">
                       <?php
                       if($user->caps['pioneer_customer']==1 || $user->caps['pioneer_customer_on_account']==1){
                       ?>
                       <span class="pioneerCheck">&#10003;</span>
                       <?php
                       }
                     ?>
                     </td>
                   </tr>
                   <?php
                } else if($user->caps['pioneer_super_customer'] == 1) {
                  ?>
                  <span class="essoCheck">&#9733;</span>
                  <?php
                } else {

                }
              }
             } else if(current_user_can('administrator') || current_user_can('shop_manager')){
               foreach($users as $user){
                 $userinfo = get_user_meta($user->ID);
                 $companyInfo = $userinfo['company'][0];
                 $expiryInfo = $userinfo['expiry'][0];
                 ?>
                 <tr>
                   <td><?php echo $user->display_name; ?></td>
                   <td><?php echo $companyInfo; ?></td>
                   <td><?php echo $expiryInfo; ?></td>
                   <td class="essoColumn">
                     <?php
                     if($user->caps['customer_on_account']==1 || $user->caps['customer']==1){
                     ?>
                     <span class="essoCheck">&#10003;</span>
                     <?php
                   } else if($user->caps['supercustomer'] == 1) {
                     ?>
                     <span class="essoCheck">&#9733;</span>
                     <?php
                   } else if($user->caps['administrator'] == 1) {
                     ?>
                     <span class="essoCheck">&#9733;A</span>
                     <?php
                   } else {

                   }
                     ?>
                   </td>
                   <td class="mobilColumn">
                     <?php
                     if($user->caps['mobile-customer-on-account']==1 || $user->caps['mobil_customer']==1){
                     ?>
                     <span class="mobilCheck">&#10003;</span>
                     <?php
                     } else if($user->caps['supercustomer'] == 1) {
                       ?>
                       <span class="essoCheck">&#9733;</span>
                       <?php
                     } else if($user->caps['administrator'] == 1) {
                       ?>
                       <span class="essoCheck">&#9733;A</span>
                       <?php
                     } else {

                     }
                     ?>
                   </td>
                   <td class="pioneerColumn">
                     <?php
                     if($user->caps['pioneer_customer']==1 || $user->caps['pioneer_customer_on_account']==1){
                     ?>
                     <span class="pioneerCheck">&#10003;</span>
                     <?php
                   } else if($user->caps['pioneer_super_customer'] == 1) {
                       ?>
                       <span class="essoCheck">&#9733;</span>
                       <?php
                     } else if($user->caps['administrator'] == 1) {
                       ?>
                       <span class="essoCheck">&#9733;A</span>
                       <?php
                     } else {

                     }
                     ?>
                   </td>
                 </tr>
                 <?php
               }
             }
            ?>
          </tbody>
        </table>
        <?php
      }

      // $allUsers = get_users(array('orderby' => 'display_name'));
      $allUsers = get_users('orderby=meta_value&meta_key=company');

      pumpUsers($allUsers);
    }

    public static function action_woocommerce_email_header( $email_heading ) {
        $new_email_heading = str_replace( 'New customer order', 'New order', $email_heading );
        return $new_email_heading;
    }

    public static function myc_email_header(){
      echo '
      <style type="text/css">
        ul.wc-item-meta {
          font-size: 12px;
          font-style: normal;
        }
        .partImage {
          max-width: 200px !important;
        }
      </style>
      ';
    }

    public static function userPaymentDisableOptions($gateways){
      global $woocommerce, $current_user;

      if(isset($gateways['cod']) && current_user_can('customer') && !isset($current_user->caps['customer_no_checkout'])){
        unset($gateways['cod']);
      } elseif(isset($gateways['cod']) && current_user_can('mobil_customer') && !isset($current_user->caps['customer_no_checkout'])){
        unset($gateways['cod']);
      } elseif(isset($gateways['cod']) && current_user_can('pioneer_customer') && !isset($current_user->caps['customer_no_checkout'])){
        unset($gateways['cod']);
      } elseif($current_user->caps['customer_no_checkout'] == 1){
        unset($gateways['cod']);
        unset($gateways['stripe']);
      }
      return $gateways;
    }

    /**************COMPANY FIELD****************/
    public static function modify_contact_methods($profile_fields) {

    	// Add new fields
    	$profile_fields['company'] = 'Company';
      $profile_fields['expiry'] = 'Expiry';

    	return $profile_fields;
    }

    //Add company colum to the user backend
    public static function user_sortable_columns( $columns ) {
    	$columns['company'] = 'Company';
      $columns['Expiry'] = 'Expiry';
    	return $columns;
    }

    public static function status_order_in_user_query($query){
    	if('Company'==$query->query_vars['orderby']) {
    		$query->query_from .= " LEFT JOIN wp_usermeta ON wp_users.ID = wp_usermeta.user_id AND meta_key = 'company'";
    		$query->query_orderby = " ORDER BY wp_usermeta.meta_value ".($query->query_vars["order"] == "ASC" ? "asc " : "desc ");//set sort order
    	}
    	//print_r($query); // for debugging
    }

    public static function extended_user_search( $user_query ){
    	// Make sure this is only applied to user search
    	if ( $user_query->query_vars['search'] ){
    		$search = trim( $user_query->query_vars['search'], '*' );
    		if ( $_REQUEST['s'] == $search ){
    			global $wpdb;
    			$user_query->query_from .= "JOIN wp_usermeta MF ON MF.user_id = {$wpdb->users}.ID AND MF.meta_key = 'company'";
    			$user_query->query_where = 'WHERE 1=1' . $user_query->get_search_sql( $search, array( 'user_login', 'user_email', 'user_nicename', 'MF.meta_value' ), 'both' );
    		}
    	}
    }

    public static function add_user_columns( $defaults ) {
         $defaults['company'] = __('Company', 'user-column');
         $defaults['expiry'] = __('Expiry', 'user-column');
         return $defaults;
    }

    public static function add_custom_user_columns($value, $column_name, $id) {
          if( $column_name == 'company' ) {
    		      return get_the_author_meta( 'company', $id );
          }
          if($column_name == 'expiry'){
            return get_the_author_meta('expiry', $id);
          }
    }

    /****LOGIN REDIRECT*****/
    public static function myc_login_redirect($redirect, $user){
      $role = $user->roles[0];
      $dashboard = admin_url();
      $myaccount = get_permalink(wc_get_page_id('my-account'));
      if($role != 'administrator'){
        $redirect = $myaccount;
      } else {
        $redirect = $dashboard;
      }

      return $redirect;
    }

    //SHOP PAGE REDIRECT

    public static function custom_shop_page_redirect() {
        if( is_shop() ){
            wp_redirect( home_url( '/' ) );
            exit();
        }
    }

    public static function myc_custom_login(){
    	wp_enqueue_style('mycLoginStyle', get_stylesheet_directory_uri().'/css/login-style.css');
    	wp_enqueue_script('mycLoginScript', get_stylesheet_directory_uri().'/js/login-script.js', array('jquery'), '1', true);
    }

    public static function myc_login_logo(){
    	return home_url();
    }

    public static function add_login_logout_link($items, $args) {
      ob_start();
      wp_loginout('');
      $loginoutlink = ob_get_contents();
      ob_end_clean();
      $items .= '<li>'. $loginoutlink .'</li>';
      return $items;
    }

    public static function myc_remove_my_account_links( $menu_links ){

    	//unset( $menu_links['dashboard'] ); // Dashboard
    	//unset( $menu_links['payment-methods'] ); // Payment Methods
    	//unset( $menu_links['orders'] ); // Orders
    	//unset( $menu_links['downloads'] ); // Downloads
    	//unset( $menu_links['edit-account'] ); // Account details
    	//unset( $menu_links['customer-logout'] ); // Logout

    	return $menu_links;

    }

    /*****LOGIN TOOLTIP LOGO*******/
    public static function my_login_logo_url_title() {
         return 'MYC Graphics Login';
    }

}


/******REMOVE LINK FROM ORDER DETAILS PRODUCT NAME**********/
add_filter( 'woocommerce_order_item_name', array('MYCAjax', 'myc_order_item_name'), 10, 3 );

/********ADD PRODUCT THUMBNAIL TO EMAIL*******/
add_filter('woocommerce_email_order_items_table', array('MYCAjax', 'myc_email_order_items_table'), 10, 2);

/***********REGISTER ACTIONS AND FILTERS***********/
add_filter('woocommerce_cart_item_permalink','__return_false');

//REDIRECT LOGGED OUT USERS
add_action('template_redirect', array('MYCAjax', 'protect_pages'));

//REGISTER SCRIPTS -> JS AND CSS
add_action('wp_enqueue_scripts', array('MYCAjax', 'theme_js'));
add_action('wp_enqueue_scripts', array('MYCAjax', 'htmlCanvas'));

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

//SET AJAX CALLBACK FUNCTION FOR HTMLCANVAS
add_filter('wp_ajax_nopriv_htmlCanvas', array('MYCAjax', 'htmlCanvasFunc'));
add_filter('wp_ajax_htmlCanvas', array('MYCAjax', 'htmlCanvasFunc'));


//GET ITEM FROM SESSION
add_action('woocommerce_get_cart_item_from_session', array('MYCAjax', 'myc_get_cart_item_from_session'), 10, 2);

//CALCULATE OPTIONS AND PRICES BEFORE FINAL TOTAL CALCULATION
add_action('woocommerce_before_calculate_totals', array('MYCAjax', 'myc_before_calculate_totals'));

//GET ITEM INFO
add_filter('woocommerce_get_item_data', array('MYCAjax', 'myc_get_item_data'), 10, 2);

//ADD ITEM META INFO
add_action( 'woocommerce_add_order_item_meta', array('MYCAjax', 'myc_add_order_item_meta'), 10, 3 );

//ADD FORM BEFORE ORDEDR NOTES
add_action('woocommerce_before_order_notes', array('MYCAjax', 'myc_before_checkout_form'));

//UPDATE ORDER META FROM CHECKOUT PAGE
add_action('woocommerce_checkout_update_order_meta', array('MYCAjax', 'myc_checkout_update_order_meta'), 10, 2);

//ADD CUSTOM INFO AFTER BILLING ADDRESS
add_action( 'woocommerce_admin_order_data_after_order_details', array('MYCAjax', 'myc_admin_order_data_after_billing_address'));

//UPDATE META ON CHECKOUT
add_action('woocommerce_checkout_update_user_meta', array('MYCAjax', 'myc_checkout_update_user_meta'));


// add_filter('woocommerce_email_order_meta_fields', array('MYCAjax', 'myc_email_order_meta_fields'), 10, 3);

//THANK YOU PAGE UPDATE
add_action('woocommerce_order_details_after_order_table', array('MYCAjax', 'myc_order_thank_you_pages'));

//EMAIL UPDATE WITH META FROM CHECKOUT
add_filter('woocommerce_email_order_meta_keys', array('MYCAjax', 'myc_email_order_meta_keys'));

//REGISTER NEW ENDPOINT FOR MY ACCOUNT PAGE
add_action('init', array('MYCAjax', 'myc_user_list_tab_endpoint_register'));


//ADD NEW QUERY VAR
add_filter('query_vars', array('MYCAjax', 'myc_query_vars'), 0);


//ADD ENDPOINT TO MY ACCOUNT MENU
add_filter('woocommerce_account_menu_items', array('MYCAjax', 'myc_woocommerce_account_menu_items'));


//ADD CONTENT TO NEW ENDPOINTS
add_action('woocommerce_account_user-list_endpoint', array('MYCAjax', 'myc_user_list_content'));


add_action('template_redirect', array('MYCAjax', 'myc_redirect'));



/*******EMAIL ORDER NAME********/

add_action( 'woocommerce_email_header', array('MYCAjax', 'action_woocommerce_email_header'), 10, 1 );

/******EMAIL FORMAT****/

add_action('woocommerce_email_header', array('MYCAjax', 'myc_email_header'));

/********USER CHECKOUT ROLES********/
add_filter('woocommerce_available_payment_gateways', array('MYCAjax', 'userPaymentDisableOptions'));


/**************COMPANY FIELD****************/
add_filter('user_contactmethods', array('MYCAjax', 'modify_contact_methods'));

//Add the colum to the user backend
add_filter( 'manage_users_sortable_columns', array('MYCAjax', 'user_sortable_columns' ));

//alter the user query and sorts whole list by company
add_action('pre_user_query', array('MYCAjax', 'status_order_in_user_query'));

//makes the user meta "company" searchable and returen results
add_action( 'pre_user_query', array('MYCAjax', 'extended_user_search' ));

//add columns to User panel list page
add_filter('manage_users_columns', array('MYCAjax', 'add_user_columns'), 15, 1);

//Print the user data in the new column
add_action('manage_users_custom_column', array('MYCAjax', 'add_custom_user_columns'), 15, 3);

/*****LOGIN REDIRECT*******/
add_filter('woocommerce_login_redirect', array('MYCAjax', array('MYCAjax', 'myc_login_redirect')), 1200, 2);

//SHOP PAGE REDIRECT
add_action( 'template_redirect', array('MYCAjax', 'custom_shop_page_redirect' ));


//WPLOGIN SCREEN CUSTOMIZE

add_action('login_enqueue_scripts', array('MYCAjax', 'myc_custom_login'));
add_filter( 'login_headerurl', array('MYCAjax', 'myc_login_logo'));

/******LOGOUT REDIRECT**********/
add_filter('wp_nav_menu_items', array('MYCAjax', 'add_login_logout_link'), 10, 2);


//CHANGE ENDPOINT URL OF LOGOUT ON MY ACCOUNT DASHBOARD

add_filter ( 'woocommerce_account_menu_items', array('MYCAjax', 'myc_remove_my_account_links' ));

add_filter( 'login_headertitle', array('MYCAjax', 'my_login_logo_url_title'));


/********TESTING****************/

?>
