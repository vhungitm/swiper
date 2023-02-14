import { useEffect, useState } from "react";

const Swiper = (props) => {
    const [currIndex, setCurrIndex] = useState(0);

    useEffect(() => {
        const {
            id,
            swiperEl,
            wrapperEl,
            buttonPrevEl,
            buttonNextEl,
            buttonDisabledEl,
            slideEl,
            slidesPerView: slidesPerViewProps,
            spaceBetween = 0,
            longSwipesMs = 500,
            breakpoints
        } = props;

        const getData = () => {
            const swiperContainer = document.getElementById(id);
            if (!swiperContainer) return;

            let breakpointsASC = Object.entries(breakpoints);
            breakpointsASC = breakpointsASC.map((item) => ({
                minWidth: item[0],
                ...item[1]
            }));
            breakpointsASC = breakpointsASC.sort((a, b) => b.minWidth - a.minWidth);
            let breakpoint = breakpointsASC?.find((item) => item.minWidth <= window.innerWidth);

            const slidesPerView = breakpoint?.slidesPerView || slidesPerViewProps || 1;

            const swiper = swiperContainer.getElementsByClassName(swiperEl || "itm-swiper")[0];
            const swiperRect = swiper.getBoundingClientRect();

            const wrapper = swiper.getElementsByClassName(wrapperEl || "itm-swiper-wrapper")[0];
            const slides = Object.values(wrapper.getElementsByClassName(slideEl || "itm-swiper-slide"));

            const totalIndex = (slides.length + 1 - slidesPerView).toFixed(0);
            if (currIndex > totalIndex - 1) setCurrIndex(totalIndex - 1);

            // Cal slide width
            let swiperWidth = swiperRect.width;
            const slideWidth = swiperWidth / slidesPerView - (spaceBetween * (slidesPerView - 1)) / slidesPerView;

            // Buttons
            const buttonNext = swiperContainer.getElementsByClassName(buttonNextEl || "itm-swiper-button-next")[0];
            const buttonPrev = swiperContainer.getElementsByClassName(buttonPrevEl || "itm-swiper-button-prev")[0];

            return {
                slidesPerView,
                swiper,
                swiperRect,
                slideWidth,
                wrapper,
                slides,
                totalIndex,
                buttonPrev,
                buttonNext
            };
        };

        let isFirst = true;
        let {
            slidesPerView,
            totalIndex,

            // Swiper
            swiper,
            swiperRect,

            // Wrapper
            wrapper,

            // Slides
            slides,
            slideWidth,

            // Buttons
            buttonPrev,
            buttonNext,

            // Touch
            isEnter = false,
            touchX = 0,
            translateX = 0,
            translateXStart = 0,
            translateXEnd = 0
        } = getData();

        const updateButtonClass = (button, type) => {
            const disabledEl = buttonDisabledEl || "itm-swiper-disabled";
            const hiddenEl = "itm-swiper-hidden";

            if (type === "hide") {
                if (isFirst) {
                    button.classList.add(hiddenEl);
                } else {
                    button.classList.remove(hiddenEl);
                    button.classList.add(disabledEl);
                }
            } else {
                button.classList.remove(disabledEl);
            }
        };

        const checkButton = () => {
            updateButtonClass(buttonPrev, currIndex === 0 ? "hide" : "show");
            updateButtonClass(buttonNext, currIndex === totalIndex - 1 ? "hide" : "show");
            if (isFirst) isFirst = false;
            updateButtonClass(buttonPrev, currIndex === 0 ? "hide" : "show");
            updateButtonClass(buttonNext, currIndex === totalIndex - 1 ? "hide" : "show");
        };

        const transformWrapper = (type) => {
            if (type) {
                if (type === "end") {
                    const touchWidth = Math.abs(translateXEnd);
                    let touchIndex = parseFloat((touchWidth / slideWidth).toFixed(0));
                    if (touchIndex >= totalIndex) touchIndex = totalIndex - 1;

                    if (translateXEnd < 0) {
                        let newCurrIndex = currIndex + touchIndex;
                        if (newCurrIndex >= totalIndex) newCurrIndex = totalIndex - 1;

                        setCurrIndex(newCurrIndex);
                    } else {
                        let newCurrIndex = currIndex - touchIndex;
                        if (newCurrIndex < 0) newCurrIndex = 0;

                        setCurrIndex(newCurrIndex);
                    }

                    wrapper.style.transitionDuration = longSwipesMs + "ms";
                    translateXStart = 0;
                    translateXEnd = 0;

                    transformWrapper();
                } else {
                    wrapper.style.transitionDuration = "0ms";
                    translateX = translateXStart + translateXEnd;
                }
            } else {
                if (currIndex < totalIndex - 1) translateX = parseFloat(-currIndex * slideWidth);
                else {
                    const slidesOnIndex = slides.length - currIndex * slidesPerView;
                    translateX = -currIndex * slidesPerView * slideWidth + (slidesPerView - slidesOnIndex) * slideWidth;
                }
                wrapper.style.transitionDuration = longSwipesMs + "ms";
            }
            wrapper.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
        };

        const updateSlideWidth = () => slides.forEach((item) => (item.style.width = slideWidth + "px"));

        const updateData = () => {
            const newData = getData();

            if (newData) {
                slidesPerView = newData.slidesPerView;

                swiper = newData.swiper;
                swiperRect = newData.swiperRect;
                slideWidth = newData.slideWidth;

                wrapper = newData.wrapper;
                slides = newData.slides;
                totalIndex = newData.totalIndex;
            }
        };

        const init = () => {
            updateData();
            checkButton();
            updateData();
            updateSlideWidth();
            transformWrapper();
        };

        init();

        // Events
        const clickNext = () => {
            setCurrIndex(currIndex === totalIndex - 1 ? 0 : currIndex + 1);
        };
        const clickPrev = () => {
            setCurrIndex(currIndex === 0 ? totalIndex - 1 : currIndex - 1);
        };

        const touchStart = (e) => {
            touchX = e.changedTouches[0].clientX;
            translateXStart = translateX;
        };

        const touchMove = (e) => {
            if (totalIndex > 1) {
                translateXEnd = e.changedTouches[0].clientX - touchX;
                if (Math.abs(translateXEnd) > 2) transformWrapper("move");
            }
        };

        const touchEnd = () => {
            transformWrapper("end");
        };

        const getPosition = function (element, evt) {
            const rect = element.getBoundingClientRect();
            const root = document.documentElement;
            const position = { x: 0, y: 0 };

            position.x = evt.clientX - rect.left - root.scrollLeft;
            position.y = evt.clientY - rect.top - root.scrollTop;

            return position;
        };

        const checkEvents = () => slides.forEach((item) => (item.style.pointerEvents = isEnter ? "none" : null));

        const mouseStart = function (e) {
            touchX = getPosition(this, e).x;
            isEnter = true;
            translateXStart = translateX;
        };

        const mouseMove = function (e) {
            if (totalIndex > 1 && isEnter) {
                translateXEnd = e.x - touchX - swiperRect.x;
                if (Math.abs(translateXEnd) > 2) {
                    checkEvents();
                    transformWrapper("move");
                }
            }
        };

        const mouseEnd = () => {
            checkEvents();

            if (isEnter) {
                transformWrapper("end");
                isEnter = false;
            }

            checkEvents();
        };

        const resize = () => {
            isFirst = true;
            init();
        };

        window.addEventListener("resize", resize);

        buttonNext.addEventListener("click", clickNext);
        buttonPrev.addEventListener("click", clickPrev);

        swiper.addEventListener("touchstart", touchStart);
        swiper.addEventListener("touchmove", touchMove);
        swiper.addEventListener("touchend", touchEnd);

        swiper.addEventListener("mousedown", mouseStart);
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseEnd);

        return () => {
            window.removeEventListener("resize", resize);

            buttonNext.removeEventListener("click", clickNext);
            buttonPrev.removeEventListener("click", clickPrev);

            swiper.removeEventListener("touchstart", touchStart);
            swiper.removeEventListener("touchmove", touchMove);
            swiper.removeEventListener("touchend", touchEnd);

            swiper.removeEventListener("mousedown", mouseStart);
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseup", mouseEnd);
        };
    }, [props, currIndex]);
};

export default Swiper;
