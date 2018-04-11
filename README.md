# Usage of Plugin
## Works with Salient Theme and Extra Product Options for now

- Need to set rules for permanently hiding template add-to-cart button
- Need to set rules for hiding button in the markup below initiall and to show it on first ajax call that displays product info

### MAKE LINK INTO AJAX CALL

Have a button or element call Ajax by:

- adding the class **ajaxModal** to an element

- adding the link (without the root) to the product page

### MARKUP FOR HTML AND AJAX CALL ELEMENT TO CALL AND DISPLAY AJAX
```
<a class="ajaxModal" href="path/to/link/without/root">Click Test</a>
<div class="ModalRow row"></div> <!--Where AJAX Content will Populate-->
<button class="ajaxButton hideOnNoAJAX ajax_add_to_cart single_add_to_cart_button" name="add-to-cart" type="submit">ADD TO CART</button><!--BUTTON THAT WILL ADD TO CART VIA AJAX WITHOUT REFRESHING PAGEo-->
```
