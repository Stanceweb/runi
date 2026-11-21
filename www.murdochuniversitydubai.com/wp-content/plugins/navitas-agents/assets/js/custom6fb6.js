jQuery(document).ready(function($) {

    // ajax top level search agent by keyword and field
    jQuery('.find-agent-btn').on('click', function(e) {

        e.preventDefault();

        jQuery('.agent-nvt-loading-icon').show();

        var ajaxurl = admin_url.ajax_url ; // get ajaxurl

        var keyword = jQuery('input[name="keyword"]').val();
        var field = jQuery('.agent-select-field:checked').val();


        jQuery.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                keyword: keyword,
                field: field,
                action: 'agent_search_result' },

            success: function (response) {
                var data = response.data;
                console.log(response);
                //if (response.data.success == true) {
                    jQuery('.agent-results').html(data.result);
                    jQuery('.agent-results-filters').html(data.filter);


                //}

            }, // success
        })
        .done(function (data) {
            jQuery('.agent-nvt-loading-icon').hide();
            agent_country_filter();
            agent_city_filter();
        });
    });

    jQuery(document).on("click", '.agent-filter-btn', function(e) {
        e.preventDefault();

        jQuery('.agent-nvt-loading-icon').show();

        var ajaxurl = admin_url.ajax_url ; // get ajaxurl
        //var keyword = jQuery('.agent-search-input').val();
        //var field = jQuery('.agent-select-field').find(":selected").val();
        var keyword = '';
        var field = '';
        var selected_countries = [];
        var selected_cities = [];


        var sortby = '';//jQuery('.filter-selected-sortby option:selected').val();

        var button_value = $(this).val();

        keyword = jQuery('.agent-filter-keyword').val();
            field = jQuery('.agent-filter-field').val();

        if (button_value == 'Apply Filter') {

            jQuery('.agent-filter-country').each(function() {
                if ($(this).prop('checked')) {
                    selected_countries.push($(this).val());
                }
            });

            jQuery('.agent-filter-city').each(function() {
                if ($(this).prop('checked')) {
                    selected_cities.push($(this).val());
                }
            });

        } else {
            selected_countries = [];
            selected_cities = [];
            sortby = '';
        }

        jQuery.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                keyword: keyword,
                field: field,
                selected_countries: selected_countries,
                selected_cities: selected_cities,
                sortby: sortby,
                action: 'filter_agent_search_result' },

            success: function (response) {
                var data = response.data;
                //console.log(response);
                //if (response.data.success == true) {

                    jQuery('.agent-results').html(data.result);
                    jQuery('.agent-results-filters').html(data.filter);
                //}

            }, // success
        })
        .done(function (data) {
            jQuery('.agent-nvt-loading-icon').hide();
            agent_country_filter();
            agent_city_filter();
        });
    });

    //jQuery( ".agent-result-column" ).on('click', function() {
    $(document).on('click', '.agent-result-column', function() {
        var table_body_class = 'agent-result-table-content';
        var column = $(this);
        var attr_sort = column.attr('data-sort');
        var column_field = column.attr('data-field');
        var attr_order = column.attr('data-order');

        var sort_icon = 'fa-solid fa-sort';
        var asc_icon = 'fa-duotone fa-sort';
        var desc_icon = 'fa-duotone fa-sort fa-swap-opacity';

        //$('.agent-result-column:after' ).css('font-family', 'Font Awesome 6 Free');
        //$('.agent-result-column:after' ).css('content', sort_icon);
        $('.nvt-find-agent .agent-sort-icon' ).removeClass('fa-solid fa-sort fa-duotone fa-sort fa-swap-opacity');
        $('.nvt-find-agent .agent-sort-icon' ).addClass('fa-solid fa-sort');

        if (attr_sort == 'asc') {
            //$('.nvt-find-agent .' + column_field + '-col:after' ).css('font-family', 'Font Awesome 6 Duotone');
            //$('.nvt-find-agent .' + column_field + '-col:after' ).css('content', asc_icon);

            $('.nvt-find-agent  .' + column_field + '-col .agent-sort-icon' ).removeClass('fa-solid fa-sort');
            $('.nvt-find-agent  .' + column_field + '-col .agent-sort-icon' ).addClass( asc_icon );
        } else {
            //$('.nvt-find-agent .' + column_field + '-col:after' ).css('font-family', 'Font Awesome 6 Duotone');
            //$('.nvt-find-agent .' + column_field + '-col:after' ).css('content', desc_icon);
            $('.nvt-find-agent  .' + column_field + '-col .agent-sort-icon' ).removeClass('fa-solid fa-sort');
            $('.nvt-find-agent  .' + column_field + '-col .agent-sort-icon' ).addClass( desc_icon );
        }

        agent_table_sort(table_body_class, column_field, attr_sort, attr_order);


    });

    jQuery(document).on("change", '.agent-delete-filter', function(e) {
        e.preventDefault();

        jQuery('.agent-nvt-loading-icon').show();

        var ajaxurl = admin_url.ajax_url ; // get ajaxurl
        var keyword = '';
        var field = '';
        var selected_countries = [];
        var selected_cities = [];
        var sortby = '';

        jQuery(this).removeClass("checked");

        jQuery('.agent-result-filter-country').each(function() {
            if ($(this).prop('checked')) {
                selected_countries.push($(this).val());
            }
        });

        jQuery('.agent-result-filter-city').each(function() {
            if ($(this).prop('checked')) {
                selected_cities.push($(this).val());
            }
        });

        keyword = jQuery('.agent-result-filter-keyword').val();
        field = jQuery('.agent-result-filter-field').val();

        jQuery.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                keyword: keyword,
                field: field,
                selected_countries: selected_countries,
                selected_cities: selected_cities,
                sortby: sortby,
                action: 'filter_agent_search_result' },

            success: function (response) {
                var data = response.data;
                console.log(response);
                //if (response.data.success == true) {

                    jQuery('.agent-results').html(data.result);
                    jQuery('.agent-results-filters').html(data.filter);
                //}

            }, // success
        })
        .done(function (data) {
            jQuery('.agent-nvt-loading-icon').hide();
            agent_country_filter();
            agent_city_filter();
        });
    });

});

function agent_table_sort(table_body_class, column_field, attr_sort, attr_order) {
    var tbody = jQuery( '.' + table_body_class );

    tbody.find( 'tr' ).sort( function( a, b ) {

        if (attr_sort == 'asc') {
            return jQuery( 'td:eq(' + attr_order + ')', a ).text().localeCompare( jQuery( 'td:eq(' + attr_order + ')', b ).text() );
        } else {
            return jQuery( 'td:eq(' + attr_order + ')', b ).text().localeCompare( jQuery( 'td:eq(' + attr_order + ')', a ).text() );
        }
    } ).appendTo( tbody );

    if ( attr_sort == "asc" ) {
        jQuery('.' + column_field + '-col').attr('data-sort', 'desc');
    }

    if ( attr_sort == "desc" ) {
        jQuery('.' + column_field + '-col').attr('data-sort', 'asc');
    }
}

function agent_country_filter() {

    var initialDisplay = 5;
    country_size_li = jQuery("#agent-country-list li").length;

    jQuery('#agent-country-list li:lt(' + initialDisplay + ')').show();

    if (country_size_li > initialDisplay) {
        jQuery('#agent-show-more-country').show();
    }

    jQuery('#agent-show-more-country').click(function () {
        //x = (x + 5 <= size_li) ? x + 5 : size_li;
        initialDisplay = country_size_li;
        jQuery('#agent-country-list li:lt(' + initialDisplay + ')').show();
        jQuery('#agent-show-less-country').show();
        if (initialDisplay == country_size_li) {
            jQuery('#agent-show-more-country').hide();
        }
    });

    jQuery('#agent-show-less-country').click(function () {
        //x = (x - 5 < 0) ? 3 : x - 5;
        initialDisplay = 5;
        jQuery('#agent-country-list li').not(':lt(' + initialDisplay + ')').hide();
        jQuery('#agent-show-more-country').show();
        jQuery('#agent-show-less-country').hide();
    });
}

function agent_city_filter() {

    var initialDisplay = 5;
    city_size_li = jQuery("#agent-city-list li").length;

    jQuery('#agent-city-list li:lt(' + initialDisplay + ')').show();

    if (city_size_li > initialDisplay) {
        jQuery('#agent-show-more-city').show();
    }

    jQuery('#agent-show-more-city').click(function () {
        //x = (x + 5 <= size_li) ? x + 5 : size_li;
        initialDisplay = city_size_li;
        jQuery('#agent-city-list li:lt(' + initialDisplay + ')').show();
        jQuery('#agent-show-less-city').show();
        if (initialDisplay == city_size_li) {
            jQuery('#agent-show-more-city').hide();
        }
    });

    jQuery('#agent-show-less-city').click(function () {
        //x = (x - 5 < 0) ? 3 : x - 5;
        initialDisplay = 5;
        jQuery('#agent-city-list li').not(':lt(' + initialDisplay + ')').hide();
        jQuery('#agent-show-more-city').show();
        jQuery('#agent-show-less-city').hide();
    });
}

