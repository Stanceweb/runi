(function( $ ) {
    'use strict';

    /**
     * All of the code for your public-facing JavaScript source
     * should reside in this file.
     *
     * Note: It has been assumed you will write jQuery code here, so the
     * $ function reference has been prepared for usage within the scope
     * of this function.
     *
     * This enables you to define handlers, for when the DOM is ready:
     *
     * $(function() {
     *
     * });
     *
     * When the window is loaded:
     *
     * $( window ).load(function() {
     *
     * });
     *
     * ...and/or other possibilities.
     *
     * Ideally, it is not considered best practise to attach more than a
     * single DOM-ready or window-load handler for a particular page.
     * Although scripts in the WordPress core, Plugins and Themes may be
     * practising this, we should strive to set a better example in our own work.
     */

    jQuery(document).ready(function($) {
        $('#program').change(function() {
            var program_name = $(this).val();  // Get the selected program
        
            // Make sure something is selected
            if (program_name) {
                // Perform AJAX request
                $.ajax({
                    url: ajax_obj.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'get_program_scholarship',  // The action hook for the PHP function
                        program: program_name,          // The selected program name
                        nonce: ajax_obj.nonce           // Nonce for security
                    },
                    success: function(response) {
                        // On success, update the scholarship input with the discount
                        if (response.success) {
                            var scholarshipValue = response.data.scholarship;
    
                            // Update the scholarship input field with the fetched value
                            $('#scholarship').val(scholarshipValue);
    
                            // If the scholarship is greater than zero, make the field read-only
                            if (scholarshipValue > 0) {
                                $('#scholarship').prop('readonly', true);  // Make it read-only
                            } else {
                                $('#scholarship').prop('readonly', false);  // Make it editable
                            }
                        } else {
                            alert('Scholarship not found for this program.');
                            // Reset the scholarship field to be editable if no scholarship is found
                            $('#scholarship').val('');
                            $('#scholarship').prop('readonly', false);
                        }
                    },
                    error: function() {
                        alert('An error occurred while fetching the scholarship data.');
                    }
                });
            }
        });
    });
    
})( jQuery );



