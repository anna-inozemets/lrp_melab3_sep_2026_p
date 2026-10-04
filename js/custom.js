// main variables that used in code
const slideContainer = document.querySelector('.slide__container')
const rotateBlock = document.querySelector('.rotate__block');
const agreementButton = document.querySelector('.agree');
const nextSlideButton = document.querySelector('.arrow--next');
const prevSlideButton = document.querySelector('.arrow--prev');

// additional variables for timeout Ids
let nextButtonTimeout;
let prevButtonTimeout;
let lastSlideActionTimeout;

// additional variables for arrows
const hiddenArrowClass = 'hidden';
let nextArrowDelay = 2.25;

// additional varibles for slides
const totalSlideAmount = 11;
const pathNames = Array.from(
  { length: totalSlideAmount }, (_, i) => ({ count: i + 1, pathName:`./slides/slide--${i + 1}.html` })
);

// additional function for detecting correct font-size
function heightDetect(percent) {
  const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  return (percent * (height - 6)) / 100;
}
function widthDetect(percent) {
  const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  return (percent * width) / 100;
}
function setResponsiveFontSize() {
  $('.slide__container').css({
    'font-size': `clamp(1px, ${heightDetect(0.925925)}px,${widthDetect(0.520833)}px)`
  });
  $('.arrows').css({
    'font-size': `clamp(1px, ${heightDetect(0.925925)}px,${widthDetect(0.520833)}px)`
  });
}

// function for action after last slide
function lastSlideAction() {
  let id = $('#presentation', window.parent.document).attr('data-id');
  let $url = $('#presentation', window.parent.document).attr('data-request-url');
  let href = $('#presentation', window.parent.document).attr('data-href');
  let $token = $('meta[name="csrf-token"]', window.parent.document).attr('content');
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $token
    }
  });
  $.ajax({
    type: "POST",
    url: $url,
    data: {"id": id},
    success: function (data) {
      if (data !== false) {
        parent.location.href = href;
      }
    },
    error: function (data) {
      console.log(data);
    }
  });
}

// function that animate number from 0 to correct num
function animateNumber(delay, className) {
  const allElements = document.querySelectorAll(`${className}[data-number]`);

  allElements.forEach(el => {
    const raw = (el.getAttribute('data-number') || '').trim();

    const normalized = raw.replace(',', '.');
    const targetNumber = Number(normalized);
    if (!isFinite(targetNumber)) {
      return;
    };

    const decimals = (normalized.split('.')[1] || '').length;
    const startRaw = (el.textContent || '').trim().replace(',', '.');
    const startVal = isFinite(parseFloat(startRaw)) ? parseFloat(startRaw) : 0;
    const proxy = { val: startVal };

    gsap.to(proxy, {
      duration: 1.5,
      val: targetNumber,
      delay,
      ease: "power1.out",
      onUpdate: () => {
        let out;
        if (decimals > 0) {
          out = proxy.val.toFixed(decimals).replace('.', ',');
        } else {
          out = Math.round(proxy.val).toString();
        }
        el.textContent = out;
      },
      onComplete: () => {
        const final = decimals > 0
          ? targetNumber.toFixed(decimals).replace('.', ',')
          : Math.round(targetNumber).toString();
        el.textContent = final;
      }
    });
  });
}

gsap.registerPlugin(TextPlugin);

// function that type text from scretch
function typewriterEffect(selector, duration, delay) {
  const el = document.querySelector(selector);
  const innerText = el.getAttribute('data-text');

  gsap.to(el, {
    duration: duration,
    text: innerText,
    ease: 'none',
    delay,
  });
}

function slideIngridientsAnimations(selector) {
  $(selector).on('click', function() {
    $(this).addClass('active');

    gsap.to($(this).find('> img'), { opacity: 1, duration: 0.75, delay: 0.5 });
    gsap.to($(this).find('.first'), { opacity: 1, duration: 0.75, delay: 1 });

    gsap.to($(this).find('.second div:not(.line)'), { opacity: 1, duration: 0.75, delay: 1.5 });
    gsap.to($(this).find('.second div.line'), { opacity: 1, duration: 0.6, delay: 1.5, scaleY: 1 });

    if ($(selector).hasClass('active')) {
      nextButtonTimeout = setTimeout(() => {
        $(nextSlideButton).removeClass(hiddenArrowClass);
        $(prevSlideButton).removeClass(hiddenArrowClass);
      }, 3.1 * 1000);
    }
  })
}

function animatePercent(element) {
  const duration = 1500;
  let start = 0;
  let target = +$(element).text().replace('%', '');
  const stepTime = Math.abs(Math.floor(duration / target));

  const timer = setInterval(() => {
    start++;
    $(element).text(`${start}%`);
    if (start >= target) {
      clearInterval(timer);
    }
  }, stepTime);
}

// object that store manipulations with slides
const slideActions = {
  1: () => {
    $('.arrow--next').addClass('arrow--white');
    gsap.from('.slide--1__left img.bottles', { opacity: 0, duration: 1, delay: 0.75, y: '10%' });
    gsap.from('.slide--1__right p.new, .slide--1__right h3', { opacity: 0, duration: 0.75, delay: 1.25 });
    gsap.from('.slide--1__right p.new, .slide--1__right h1', { opacity: 0, duration: 0.75, delay: 1.75 });
    gsap.from('.slide--1__right p.new, .slide--1__right p', { opacity: 0, duration: 0.75, delay: 2.25 });
    nextArrowDelay = 3.75;
  },
  2: () => {
    $('.arrow--prev').addClass('arrow--white');
    $('.arrow--next').addClass('arrow--white');
    $('.slide--2__percentages-text strong').each(function() {
      animatePercent($(this));
    })
    gsap.from('.slide--2__percentages-lines', { opacity: 0, duration: 0.75, delay: 1.5 });
    gsap.from('.slide--2__left-text h2', { opacity: 0, duration: 0.75, delay: 1.75, x: '-10%' });
    gsap.from('.slide--2__left-text p', { opacity: 0, duration: 0.75, delay: 2.25, x: '-10%' });
    gsap.from('.slide--2__right-text h2', { opacity: 0, duration: 0.75, delay: 2.75, y: '-10%' });
    gsap.from('.slide--2__right-text h1', { opacity: 0, duration: 0.75, delay: 3.25, y: '-10%' });
    gsap.from('.slide--2__right-text p', { opacity: 0, duration: 0.75, delay: 3.75, y: '-10%' });
    nextArrowDelay = 4.75;
  },
  3: () => {
    $('.arrows').removeClass('arrows--top');
    $('.arrow--prev').addClass('arrow--white');
    $('.arrow--next').addClass('arrow--white');
    $('.slide--3__click-area').on('click', function() {
      $(this).addClass('active');

      gsap.to($('.slide--3__center span'), { opacity: 1, duration: 0.75, delay: 0.25, x: 0 });
      gsap.to($('.slide--3__center h1'), { opacity: 1, duration: 0.75, delay: 0.75, x: 0 });
      gsap.to($('.slide--3__center p'), { opacity: 1, duration: 0.75, delay: 0.75, x: 0 });
      gsap.to($('.slide--3__left-content'), { opacity: 1, duration: 0.75, delay: 1.25, x: 0 });
      gsap.to($('.slide--3__right-content'), { opacity: 1, duration: 0.75, delay: 1.75, x: 0 });

      if ($('.slide--3__click-area').hasClass('active')) {
        nextButtonTimeout = setTimeout(() => {
          $(nextSlideButton).removeClass(hiddenArrowClass);
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 3 * 1000);
      }
    })
  },
  4: () => {
    $('.arrows').removeClass('arrows--top');
    $('.arrow--prev').addClass('arrow--white');
    $('.arrow--next').addClass('arrow--white');
    $('.slide--4__right-content .info-item div').on('click', function() {
      $(this).parent().addClass('active');
      $(this).addClass('active');

      gsap.to($(this).find('p'), { opacity: 1, duration: 0.5, delay: 0.25, y: 0 });
      gsap.to($(this).find('+ ul'), { opacity: 1, duration: 0.5, delay: 0.75, y: 0 });

      if ($('.slide--4__right-content .info-item div.active').length === 6) {
        nextButtonTimeout = setTimeout(() => {
          $(nextSlideButton).removeClass(hiddenArrowClass);
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 1.75 * 1000);
      }
    })
  },
  5: () => {
    $('.arrows').removeClass('arrows--top');
    $('.arrow--prev').removeClass('arrow--white');
    $('.arrow--next').removeClass('arrow--white');
    
    gsap.from('.slide--5__right h1', { opacity: 0, duration: 0.75, delay: 1.5, y: '-10%' });
    gsap.from('.slide--5__right .benefits-list li:nth-child(1)', { opacity: 0, duration: 0.75, delay: 1.75, x: '-10%' });
    gsap.from('.slide--5__right .benefits-list li:nth-child(2)', { opacity: 0, duration: 0.75, delay: 2, x: '-10%' });
    gsap.from('.slide--5__right .benefits-list li:nth-child(3)', { opacity: 0, duration: 0.75, delay: 2.25, x: '-10%' });
    gsap.from('.slide--5__right .benefits-list li:nth-child(4)', { opacity: 0, duration: 0.75, delay: 2.5, x: '-10%' });
    gsap.from('.slide--5__right .benefits-list li:nth-child(5)', { opacity: 0, duration: 0.75, delay: 2.75, x: '-10%' });
    gsap.from('.slide--5__right .border-text', { opacity: 0, duration: 0.75, delay: 3.25, y: '-10%' });
    nextArrowDelay = 4.25;
  },
  6: () => {
    $('.arrows').removeClass('arrows--top');
    $('.arrow--prev').addClass('arrow--white');
    $('.arrow--next').addClass('arrow--white');
    
    gsap.from('.slide--6__left h3', { opacity: 0, duration: 0.75, delay: 0.75, x: '-10%' });
    gsap.from('.slide--6__right h3', { opacity: 0, duration: 0.75, delay: 0.75, x: '10%' });
    gsap.from('.slide--6__left .info', { opacity: 0, duration: 0.75, delay: 1.5, y: '-10%' });
    gsap.from('.slide--6__left .border-text', { opacity: 0, duration: 0.75, delay: 1.5, y: '-10%' });
    gsap.from('.slide--6__right .info', { opacity: 0, duration: 0.75, delay: 2.25, y: '-10%' });
    
    nextArrowDelay = 3.25;
  },
  7: () => {
    $('.arrow--prev').addClass('arrow--white');
    $('.arrow--next').addClass('arrow--white');

    $('.slide--7__click-area').on('click', function() {
      $(this).addClass('active');

      gsap.to('.slide--7__left .info-block .info:nth-child(1)', { opacity: 1, duration: 0.75, delay: 0.75, x: 0 });
      gsap.to('.slide--7__left .info-block .info:nth-child(2)', { opacity: 1, duration: 0.75, delay: 1, x: 0 });
      gsap.to('.slide--7__left .info-block .info:nth-child(3)', { opacity: 1, duration: 0.75, delay: 1.25, x: 0 });
      gsap.to('.slide--7__left .info-block .info:nth-child(4)', { opacity: 1, duration: 0.75, delay: 1.5, x: 0 });
      gsap.to('.slide--7__right .info-block .info:nth-child(1)', { opacity: 1, duration: 0.75, delay: 1.75, x: 0 });
      gsap.to('.slide--7__right .info-block .info:nth-child(2)', { opacity: 1, duration: 0.75, delay: 2, x: 0 });
      gsap.to('.slide--7__right .info-block .info:nth-child(3)', { opacity: 1, duration: 0.75, delay: 2.25, x: 0 });
      gsap.to('.slide--7__right .info-block .info:nth-child(4)', { opacity: 1, duration: 0.75, delay: 2.5, x: 0 });

      if ($('.slide--7__click-area').hasClass('active')) {
        nextButtonTimeout = setTimeout(() => {
          $(nextSlideButton).removeClass(hiddenArrowClass);
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 3 * 1000);
      }
    })

  },
  8: () => {
    $('.arrows').removeClass('arrows--top');
    $('.arrow--prev').addClass('arrow--white');
    $('.arrow--next').addClass('arrow--white');
    $('.slide--8__click-area').on('click', function() {
      $(this).addClass('active');

      gsap.to($('.slide--8__right'), { opacity: 1, duration: 0.5, delay: 0.25, x: 0 });
      gsap.to($('.slide--8__left .text'), { opacity: 1, duration: 0.5, delay: 0.75, y: 0 });
      gsap.to($('.slide--8__left .reinforced-block'), { opacity: 1, duration: 0.5, delay: 1.25, y: 0 });
      gsap.to($('.slide--8__left .border-info'), { opacity: 1, duration: 0.5, delay: 1.75, y: 0 });
      if ($('.slide--8__click-area').hasClass('active')) {
        nextButtonTimeout = setTimeout(() => {
          $(nextSlideButton).removeClass(hiddenArrowClass);
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 2.75 * 1000);
      }
    })
  },
  9: () => {
    $('.arrow--prev').removeClass('arrow--white');
    $('.arrow--next').removeClass('arrow--white');
    $('.slide--9 .click-area').on('click', function() {
      $(this).addClass('active');

      gsap.to($('.slide--9__right h5.title--1, .slide--9__right ul.list--1'), { opacity: 1, duration: 0.75, delay: 0.25, y: 0 });
      gsap.to($('.slide--9__right h5.title--2, .slide--9__right ul.list--2'), { opacity: 1, duration: 0.75, delay: 0.5, y: 0 });
      gsap.to($('.slide--9__right h5.title--3, .slide--9__right h5.title--3 + p'), { opacity: 1, duration: 0.75, delay: 0.75, y: 0 });

      if($('.slide--9 .click-area').hasClass('active')) {
        nextButtonTimeout = setTimeout(() => {
          $(nextSlideButton).removeClass(hiddenArrowClass);
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 2.5 * 1000);
      }
    })
  },
  10: () => {
    clearTimeout(lastSlideActionTimeout);
    $('.slide--10__left-content img.bottle').on('click', function() {
      $(this).parent().addClass('active');

      gsap.to($('.slide--10__left p.accent'), { opacity: 1, duration: 0.75, delay: 0.25, x: 0 });

      gsap.to($('.slide--10__right h5.title--1, .slide--10__right ul'), { opacity: 1, duration: 0.75, delay: 1, x: 0 });
      gsap.to($('.slide--10__right h5.title--2, .slide--10__right-block'), { opacity: 1, duration: 0.75, delay: 1.25, x: 0 });
      gsap.to($('.slide--10__right h5.title--3, .slide--10__right h5.title--3 + p'), { opacity: 1, duration: 0.75, delay: 1.5, x: 0 });

      if($('.slide--10__left-content').hasClass('active')) {
        nextButtonTimeout = setTimeout(() => {
          $(nextSlideButton).removeClass(hiddenArrowClass);
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 3.25 * 1000);
      }
    })
  },
  11: () => {
    $('.arrow--prev').removeClass('arrow--white');
    $('.arrow--next').removeClass('arrow--white');

    $('.slide--11__left .slide--11__block').on('click', function() {
      $(this).addClass('active');

      gsap.to($(this).find('.new'), { opacity: 1, duration: 0.75, delay: 0.25, x: 0 });
      gsap.to($(this).find('.label'), { opacity: 1, duration: 0.75, delay: 0.25, x: 0 });
      gsap.to($(this).find('.label .line'), { opacity: 1, duration: 0.75, delay: 0.25 });
      gsap.from($(this).find('.label .line'), { duration: 0.75, delay: 0.25, width: 0 });
      gsap.to($(this).find('h3'), { opacity: 1, duration: 0.75, delay: 0.75, x: 0 });
      gsap.to($(this).find('p'), { opacity: 1, duration: 0.75, delay: 1.25, x: 0 });
      gsap.to($(this).find('.sublabel'), { opacity: 1, duration: 0.75, delay: 1.75, x: 0 });

      if ($('.slide--11__block.active').length === 6) {
        nextButtonTimeout = setTimeout(() => {
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 1.25 * 1000);

        lastSlideActionTimeout = setTimeout(() => {
          $('button.close-presentation').addClass('visible');
        }, 4 * 1000)
      }
    })

    $('.slide--11__right .slide--11__block').on('click', function() {
      $(this).addClass('active');

      gsap.to($(this).find('.new'), { opacity: 1, duration: 0.75, delay: 0.25, x: 0 });
      gsap.to($(this).find('.label'), { opacity: 1, duration: 0.75, delay: 0.25, x: 0 });
      gsap.to($(this).find('.label .line'), { opacity: 1, duration: 0.75, delay: 0.25 });
      gsap.from($(this).find('.label .line'), { duration: 0.75, delay: 0.25, width: 0 });
      gsap.to($(this).find('h3'), { opacity: 1, duration: 0.75, delay: 0.75, x: 0 });
      gsap.to($(this).find('p'), { opacity: 1, duration: 0.75, delay: 1.25, x: 0 });
      gsap.to($(this).find('.sublabel'), { opacity: 1, duration: 0.75, delay: 1.75, x: 0 });

      if ($('.slide--11__block.active').length === 6) {
        nextButtonTimeout = setTimeout(() => {
          $(prevSlideButton).removeClass(hiddenArrowClass);
        }, 1.25 * 1000);

        lastSlideActionTimeout = setTimeout(() => {
          $('button.close-presentation').addClass('visible');
        }, 4 * 1000)
      }
    })

    $('button.close-presentation').on('click', function() {
      $(this).addClass('clicked');
      lastSlideAction();
    })
  },
}
// function that add animation for element
function animateSlide(slideNum = 1) {
  gsap.from('.slide', { opacity: 0, duration: 0.75 });

  slideActions[slideNum]();
}
// function that detect oriental of device
function updateRotateBlockVisibility() {
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;

  $(rotateBlock).toggleClass('visible', isPortrait);
}
// function that load slide without reloading page
async function loadComponent(componentPathName, slideNum) {
  const response = await fetch(componentPathName);
  const data = await response.text();

  slideContainer.innerHTML = data;
  animateSlide(slideNum);
}
// function that update info about prev/next button
function updateNavigationButtons(currentSlide) {
  clearTimeout(nextButtonTimeout);
  clearTimeout(prevButtonTimeout);

  $(nextSlideButton).addClass(hiddenArrowClass);
  $(prevSlideButton).addClass(hiddenArrowClass);

  switch (currentSlide) {
    case 0:
      break;
    case 1:
      nextButtonTimeout = setTimeout(() => {
        $(nextSlideButton).removeClass(hiddenArrowClass);
      }, nextArrowDelay * 1000);
      break;
    case 3:
    case 4:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
      break;
    case totalSlideAmount:
      $(prevSlideButton).removeClass(hiddenArrowClass);
      break;
    default:
      nextButtonTimeout = setTimeout(() => {
        $(nextSlideButton).removeClass(hiddenArrowClass);
        $(prevSlideButton).removeClass(hiddenArrowClass);
      }, nextArrowDelay * 1000);
  }
}
// function that change slide on the screen
async function changeSlide(direction) {
  const currentSlideNum = slideContainer.getAttribute('data-current-slide');

  let newSlideNum;

  if (direction === 'next') {
    newSlideNum = Number(currentSlideNum) + 1;
  } else if (direction === 'prev') {
    newSlideNum = Number(currentSlideNum) - 1;
  }

  const { pathName } = pathNames.find(pathNameInfo => pathNameInfo.count === +newSlideNum);

  await loadComponent(pathName, newSlideNum);

  slideContainer.setAttribute('data-current-slide', newSlideNum);
  updateNavigationButtons(newSlideNum);
}

//window and document listeners
$(document).ready(function () {
  setResponsiveFontSize();
  updateRotateBlockVisibility();
});
$(window).on('resize', function () {
  setResponsiveFontSize();
  updateRotateBlockVisibility();
});
$(window).on('orientationchange', function () {
  updateRotateBlockVisibility();
});

// button listeners
$(agreementButton).on('click', () => {
  loadComponent(pathNames[0].pathName);
  slideContainer.setAttribute('data-current-slide', 1);
  updateNavigationButtons(1);
});
$(nextSlideButton).on('click', () => {
  changeSlide('next')
})
$(prevSlideButton).on('click', () => {
  changeSlide('prev')
});
