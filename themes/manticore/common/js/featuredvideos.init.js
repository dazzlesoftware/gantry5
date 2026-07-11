jQuery(document).ready(function () {
    // Parse YouTube URL
    function youtube_parser(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }
    // Grab video ID's
    var yT_videos = '';
    var yT_token = '';
    jQuery('[data-featuredvideos-id]').each(function (index) {
        yT_token = jQuery(this).data('featuredvideos-accesstoken');
        jQuery('.g-featuredvideos-item-yt', this).each(function (index) {
            yT_videos += youtube_parser(jQuery(this).attr("href")) + ',';
        });

    });
    jQuery.getJSON('https://www.googleapis.com/youtube/v3/videos?key='+ yT_token +'&fields=items(statistics(likeCount))&part=snippet,statistics&id=' + yT_videos, yT_data)
    
    // Populate data
    function yT_data(data) {
        jQuery('[data-featuredvideos-id]').each(function (index) {
            jQuery('.g-featuredvideos-item-count', this).each(function (item_index) {
                jQuery('span', this).text(data.items[item_index].statistics.likeCount);
            });
        });
    }
});
