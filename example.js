var carousel = new PtCarousel(document.getElementsByClassName('animate'), 5000, adjust);

/**
 * 
 * @param { SkCarousel } me 
 */
function adjust(me) {
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var outgoingId = me.currId;
    var incomingId = (me.currId == (me.members.length - 1)) ? 0 : (me.currId + 1);

    carouselBtns[outgoingId].classList.remove('active-btn');
    carouselBtns[incomingId].classList.add('active-btn');
}

function go(id) {

    var callback = function (id) {
        var carouselBtns = document.getElementsByClassName('carousel-btn');
        for (var i = 0; i < carouselBtns.length; i++) {
            carouselBtns[i].classList.remove('active-btn');
        }
        carouselBtns[id].classList.add('active-btn');        
    }

    carousel.goTo(id, callback);
}