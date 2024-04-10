import Vue from 'vue'

export function createBarLoader ({ timeLeft, componentObject, percentVar }) {

  let percent = 0,
    _timer = null,
    _cut,

  finish = function() {
    percent = 100
    clearInterval(_timer)
    _timer = null
  };

  return {
    percent: percent,
    start () {
      if (_timer) {
        clearInterval(_timer)
        percent = 0
      }
      _cut = (100 - percent) / timeLeft * 10

      _timer = setInterval(() => {
        percent = percent + _cut

        Vue.set(componentObject, percentVar, percent)

        if (percent > 99) {
          finish()
        }
      }, 10)

    },
    pause () {
      clearInterval(_timer)
    },
    resume({timeLeft}) {
      if (_timer === null) {
        _cut = (100 - percent) / timeLeft / 10

        _timer = setInterval(() => {
          percent = percent + _cut
          if (percent > 99) {
            finish()
          }
        }, 10)
      }
    },
    finish: finish



  }

}
