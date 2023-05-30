

$(document).ready(() => {
    // console.log('load index.sj');
    (async () => {
        if (location.href.includes("w/wholesale") || location.href.includes("/category") || location.href.includes("/af/")) {

            appendModalHtml();
            handleProductItems();

            let timer = setInterval(() => {
                let lazyLoad = $('#card-list div.lazy-load');
                if (lazyLoad.length > 0) {
                    handleProductItems();

                } else {
                    clearInterval(timer);
                    setTimeout(() => {
                        handleProductItems();
                    }, 1 * 1000);
                }
            }, 1 * 1000)
        }

    })();
});
const PRODUCT_MEMBER = {};
function handleProductItems() {
    $('#card-list a.search-card-item').each((index, el) => {
        let isExits = $(el).find('a.ali-reviews-a-asdw');
        if (isExits.length == 0) {
            appendReviewsElementAndBindEvent(el);
        }
    });
}

function appendReviewsElementAndBindEvent(el) {
    let url = $(el).attr("href");
    if (url) {
        
        let span = $(`<a href="javascript:void(0);" class="ali-reviews-a-asdw" >Reviews</a>`);
        span.css('float', "right");
        $(el).find('span.cards--store--A2ezoRc').append(span);

        span.click((e) => {
            let target = e.target;
            $(target).css('color', '#0d6efd');
            let href = $(target).parents('a.search-card-item').attr('href');
            let id = getProductIdWith(href);
            let ownerMember = PRODUCT_MEMBER[id];
            // console.log("ownerMember", id, ownerMember);
            if (ownerMember) {
                showIframWith(id, ownerMember);
            } else {

                let storeUrl = $(el).find('span.cards--store--A2ezoRc a:nth-child(1)').attr('href');
                fetchStoreMemberId(storeUrl, (ownerMemberId) => {
                    PRODUCT_MEMBER[id] = ownerMemberId;
                    showIframWith(id, ownerMemberId);

                });
            }

            return false;
        });

    }
}

function getProductIdWith(url) {
    return url.substring(url.indexOf('item/') + 5, url.indexOf('.html'));
}
function showIframWith(productId, ownerMemberId) {
    let iframe = `<iframe class="product-evaluation" id="product-evaluation" scrolling="no" frameborder="0" 
        marginwidth="0" marginheight="0" width="100%" height="4000px"
        src="//feedback.aliexpress.com/display/productEvaluation.htm?v=2&amp;productId=${productId}&amp;ownerMemberId=${ownerMemberId}&amp;companyId=&amp;memberType=seller&amp;startValidDate=&amp;i18n=true">
    </iframe>`;

    $('#ali-reviews-modal .modal-body').html(iframe);
    $('#ali-reviews-modal').modal('show');
}
async function fetchStoreMemberId(storeUrl, callback) {
    let host = window.location.host;
    if (storeUrl && storeUrl.indexOf(host) < 0 ) {
        storeUrl = storeUrl.replaceAll('www.aliexpress.com',host);
    }
    let storeResponse = await fetchProductReviews.getContent(storeUrl);
    // console.log('storeContent:', storeResponse);

    if (storeResponse.ok) {
        const content = await storeResponse.text();
        let start = content.indexOf('pageConfig');
        let end = content.indexOf('</script>', start);

        let storeConfig = content.substring(start, end);
        storeConfig = storeConfig.replaceAll(' ', '').substring(11, end);

        start = storeConfig.indexOf("ownerMemberId:'");
        end = storeConfig.indexOf("'", start + 15);

        let ownerMemberId = storeConfig.substring(start + 15, end)
        // console.log('ownerMemberId:', ownerMemberId);
        if (callback) {
            callback(ownerMemberId);
        }
    }
}

function appendModalHtml() {

    let content = `
    <div class="modal fade" id="ali-reviews-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="ali-reviews-modal-title">Reviews</h6>
                </button>
            </div>
            <div class="modal-body" style="height:600px; overflow:auto;">
                ...
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
            </div>
        </div>
    </div>
    `;

    $('body').append(content);
    $('#ali-reviews-modal .modal-footer button').on('click', () => {
        $('#ali-reviews-modal').modal('hide');
    });
}
const fetchProductReviews = {

    postFormData: (url, data) => {

        var formBody = [];
        let keys = Object.keys(data);
        keys.forEach(k => {
            var encodedKey = encodeURIComponent(k);
            var encodedValue = encodeURIComponent(data[k]);
            formBody.push(encodedKey + "=" + encodedValue);
        });

        let body = formBody.join('&');
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: body,
        });
    },

    getContent: (url) => {
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "text/html,application/xhtml+xml;charset=UTF-8",
            }
        });
    }

}