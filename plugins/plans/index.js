const generalConfigs = require('../../configs/general');


const plans = {
  monthly: {
    monthly695: {
      price: '6.95',
      paypalPlanId: '466KEWAGRY8BS',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jn7Tq35UpqrQThoswygHXyHgboffAWl06MhsNVL6XUos2wVITjBuGX+2qezVg4DkCApGZr2h17RnTIxC68k9KMH0awoQKIkQngSTPCIcDDnKV2uvVAJ0hyfDxHy5RbeU7EeTc64LF+D4SZNTvlTkEQgXNUq32a09Y9/0n9w9E2aNamgVZiklGycofJfQ1pEsbkYsWMsq+27VuRpFV2bb1Ee/6F8Q5sR/uVhmoN1mMpNQgc+3O7mBbbUk7rQA8LS1rNUrLu5EC1usn1mgEcklhzxQ=='
    },
    monthly699: {
      price: '6.99',
      paypalPlanId: 'ENUWUFAYXU636',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnQkv3HjH9SCDgSH83IXufO9g5ufqA0xBxjX7sUy9R/Pm6vHmikn3O+Rf73uEFM7u+oSQNzzFtpJoQMJOhsQl0HRprRvFI1PSboTTOm4pOwchhM9BwBKrAJ81R+t7sY0Xzx52q4OESqLsO6jsemyIwsT2Hf27J6RYkriN2cuR9hsLNlg1AywIvKXTgHeQy103kr+FHQ2i2Y8hSyFHO1p3v3mcFbyMonG4UvXWV/iG8Xg9u6Z90jFrPd7e721pC2EZtjGumrP5cqoAUSl81WCjosQ=='
    },
    monthly795: {
      price: '7.95',
      paypalPlanId: 'NPMNPLJ6434H4',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnZbOpw3X/np+Fa+XCQKv+rj3rT6OcaVYqLa7/eNFpt6PwIDhVV82vvdtZYl2HKAUWlokBnHpRzvp5FNHwZp2lVBM5zfI/8uCo4sKjIXZLzHhxMMtovzsIgKzqULtpF3ICReiWI/ZVHxGaQ6sokbznCXy2iXSrgr9934UT2BguR5W+1lz2GfIb0fR/m6/sLZYvfZmD3yiKUk3c51NcH4D6BcNGFjqKPpm6gZNiZwTGGC24RNPWw9D84N3ZFI7UM0tKUane1GmfP0ZJ29uA3r4+JA=='
    },
    monthly799: {
      price: '7.99',
      paypalPlanId: '7NE9MTWQ4HMC4',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnV7CsE91qZcRqt/ml/dARMOypqZvfEPo9RNbu1R9ooh2pQ7+Hq0ak7mAyczh42s+yCchquP3FLfcVF5d3+ahZPrHJkMn51VCLGouzmshFfrUqcyxZF1dQAcPDcG4HJkpQtYp0anxAb+BEUThZT6bNkIPiRVCQXIsAsIH/SO593dfso+VlPxUkEuqATlsHXysUsI8zLdB5u1aWH7ke9hIISsimhS5YsqZ0/3ve9ClVDl1zawUKtGFohJiqaYrwVOaK1Jh4e/+5Ks0BX1TsSTqjZg=='
    },
    monthly895: {
      price: '8.95',
      paypalPlanId: 'EPSS4AKGYU4GA',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnauDJ8LQYAGZobWwKwCDjCAZXHoRr+A56JCADSBRa+NLIeMZS3OjFgRaDe5tJCKcT5nuQJBOids4tivAHy6TJbqCoCSohAdN3UumJCrmu3yArZiKNJRsXvGlabVh6FH5bYDvihWj+caSityuTvwU6oE5upEd4yEGGHEUG7k/EPwVdN8C3BTc5eYkJCv5br9uxxcKsM6j+ELpsodG8bAv0qDhOqL6e3Ybd2zTT47FF+RmVk1nTjXiYQFEcbRfwz1M7oCnSQfAh3+v6C5SQbjIV9A=='
    },
    monthly899: {
      price: '8.99',
      paypalPlanId: 'S68YBZNHL3U26',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnexv8GtGfdKLSQF3dMsypr+bfvskNN3TpU4vCP7MhsTHnZSWv3d/ERd1J55vBB0qi7wD21IfWU7UILLRwUc+Mnqq4Jt4AJOLqipizMw0tOD9rt0iUIl1K/imH4lcjtiq8CPaIRtlyo1Tw+YFuB2jjpYGuMY2s2W8N2LQOIGdjwhGu6/5sdtRIZzATTeZj5JHGi22eBNW4BHircEwry2s0Ex9hIDCfoHICsrO7bVtV/wbSKAKFjesw4l69+pw9ZOehJcGH8gZ+J7PwMdImzib2Dg=='
    },
    monthly900: {
      price: '9.00',
      paypalPlanId: '7JTAZ9J4HR448',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnzNEml0ecKjQOfvUJtQyPu6Cq5uHWY8hb8BDH45f4c+77yBfP6gSz/DLRwghjzQo7BWM9XEtndGAfUWCeIZgwVKbXH0/sNsZ8Y0txL+cjLpFzsqC2Hjrsb7CPgwmwsf4WMrEQLdyV2p2pAw8ybWs4x00GUbc6LGzDFY86wHWkj1M+g42HEi6+Vexk9vc6TUccwsglkv6GlgWMgfOf1BJz2PoCetYEVEJDBY0j4fH/hqQnR2g4CGez7pusbISad1rHMHElugQnPcs2pWbuZx3ZPQ=='
    },
    monthly995: {
      price: '9.95',
      paypalPlanId: 'AHDYB42TKUU86',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnkTw2ovBjJrMGST1fj2rldqX6iQM15wq7Uib2GzJAeGFkO5seueXVlAxhRCmvItOJFH97ylOL0WxHn/bFgMYyG/i7GwOUlIBriXQ6mzdUE5Ne4lpLyu68n2P2J7x94Q7+IVy1ocWq8TWvkI3USMAgpKiqU4ugL4VWeLpfJ5qddQvUbfXdgfAc/TU5R1d5xyihC0a6iGItAdgTGojfV2b6fkMQmbjF8GUIw3R+iAn/xUEvazhJnHF5AQcg+fa8MikOHBn1SBk33z/sEFc4GLBvvw=='
    },
    monthly999: {
      price: '9.99',
      paypalPlanId: 'YPBPQWXPMK8JJ',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jn3DzZipjKcfFamTVH9sj8Un0sFWgLsus4hxnYnkXnzA9nhxjFXJBgZG4BmVT/q306b2fsRp4mKgdPXyaQye6RDNGizEjbjfO7pKqenRA5F1xVeavNPGn3/mOTViREDz5zSBZh3MgvxMTI2Y94Q6u5KDznRfKJOFabHhiFW+URWPmmJsAvlECDpyFkKRqT6BbuXurkpL0s3q0e1BGpbDjmgvxkCkgUEgB4Q3pGoBCvSDNpADc6ohsoIJVhjufMi9TfkHtXNFvAJgYrs5UC9WYc8w=='
    },
    monthly1000: {
      price: '10.00',
      paypalPlanId: 'DPCN6JYESL73U',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jn/azkgwU8tB8Kea3qyxNrItkQzwS0cH7ch3nmw7QDs6N4qMNTxRyxSU7Kz2+mEEF1Rfqec2D4jSGcK+5d+mFAwYRFWGzXdv/eYT11h/+pnSNVWxfoj09BlrWWfzq3/qZDrR7tFjx1wUqaNoTjtJOSJihxl1X+XfnnOU/4RNEYBN+EqaAYdi0cVQVHPfcvVX32KD5qqU57TyOzDJlrg8UFrXCmusBCSao5izlOcUWmizm7La/AZTU36O2g/NlRMxBEssg5XdU7QlivfigJf4SiMA=='
    },
    monthly1095: {
      price: '10.95',
      paypalPlanId: 'E2CHFGHJKFSQ6',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnoYDeFXEZ4XaCCvG3MDHpdGvI8Fc1dDM4ecHNrkeJrqCQBVmFwTX92+ZKqQJWDowREzKooAl6BjmgqJIj4nc/X3tiAGxwSdjonhRnnlbC17VJ5AptIA3rJUtiHRlFDQkGvMnrC7mrU4mqQVCzBc4HBb6dmY9Np10zmaUNLCIfNOPH6vWlmvdHEQSM91N+X8BFZRZq8slxbZ/e2U/2Dg+Iag8ebTyBh8cFgJmmqm06HLOLnUjMt1LUphKoB1thdCUak3GRrD2L8WP6/JFVp2z8QQ=='
    },
    monthly1099: {
      price: '10.99',
      paypalPlanId: 'JQKQTLQL43Y9L',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnRywVKT4OVrHibal/XiK4wMwhmICiuy0a+lO71XuV7z9BuRZSvP8LVynZy649kJ5of25EEEyo9lp7bHJKCbSJGYXzqteHFHo+Prllrf0rK9V0dN2IQE7vpxFrmCspUp7DaB4z4YjDhaCeGEM5oTLl47Jt7u7PG+2f9jfKluhXG931zFtQ7wDHykv9Sp49qIQF7b8JK0/Jo3V+R/YBL6DH6RVSAyYQ1G6zzS91/vK4jYETMUNRcgeZsUj5H6x9SnmfFBF9m07ebIQO/bq0vkGoEA=='
    },
    monthly1195: {
      price: '11.95',
      paypalPlanId: '2R5T5E59ST644',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnp5jYgj/2aYfZd0H40aBlfItmeQrDtwU7MrqGhe5/oxLCtzeKz7n8GSp2EAn8BmrLPXyeavY02cewvv0Wn5xHwhEF/GiLUGYw52SQVKmd8hKhDHPg9dzew0l4qlhKdWTZzVwmMXfksoGfieHhpWP254xslZvnNquktHQiEJjEyfTa4SQuYxHn30cREdTwM/5royrFXSbBWLQv7ilKbwZ8Mt2feiT4z7x/qvZCDc3HCy/ym6DxS+8Ydo8F4ZAKH0tup5mYwCCELWahy6A5HR/oFw=='
    },
    monthly1199: {
      price: '11.99',
      paypalPlanId: 'T78QUYAVU6UNG',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnT7oa8rgqiIkEeyjsuSrcZOEkwwlZ06POdUwInkwBO6RyzoJQbENoX3eK6YQ1aBgQwN/xPLUbXMonftf3qFkjkT1UGr8ZNHkINFFfXsuEjWIX5Kc+L+Q3VrzFPIliB37cTqdq+F8NvcxsO6dXtfpnfVyc8+dIpA1LiOSi5ScBhT/B00c71wXOrDXrLJ8LomLKv8TOQtqen6VyVZMpDlPJQ7kun/mwNIR9wRxKNeOVY3jzSzRN9js5yu2FV8sMn6LPDLRz+ykYThuFI6rsXf0W+w=='
    },
    monthly1295: {
      price: '12.95',
      paypalPlanId: 'XAMJHKYV6VXN6',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnzVvXe2QPwXCEMpsFF1F48btFz2zXpL0bZ0Zwtpni3J7jalLWtdx7WBFsLjdpQTo9QAZZWMB5qvmALn8fgDZlHhazhl3IOv16HR2Ynrh6Gav4/YoEQmbgo2gT3ZOm03O9Y1t6FViIm8Z8BqsvO9Vx/Hn2ZbMBvVSn76e3cjK2DWmXxAu09qI8O9oloC16iceLu/UIUhK1dyr3Jp5U/emOYm6gMWx7YhjOiysMvNojZUzsYZHShOOZTaJNM1OO8qZVVpmLvyLjCiVnZLxPoZiDXA=='
    },
    monthly1299: {
      price: '12.99',
      paypalPlanId: 'U4JFUD46XYQT2',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsLyVc4S5mZ09m7fyS/nE+jnR+CP/6jBikL5z9oQKbcQINXlxTKbXw9P0leqpIocy1d7vzNh3VwxTXiEBsUd1pGnq4ngX0SKp0h6C7FKruX2qzgSTTt9xt2VoQGIPmyK17rKMfExCujJ4GjFx/VO96AHuHTN2zSXyiDxlo4TTBdFqJGQRN/eAvSI40fFIhv817dA9+XnrjpsOFPOGuD9lRz6MlVofq69ibZeIeyVaKnas2XhOtNCEq5hlwYqZ6GUyt86U0w03uZIus0/3Wlu3489p1+26pkB15N4JgasaY00+w=='
    }
  },
  semiannually: {
    semiannually2995: {
      price: '29.95',
      paypalPlanId: 'GKQW2BV86PYJL',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtZHpb8YyE3xsdY3MVDVT9YvLgrN7kGbkv/+zY08sAI2K4F/KJz6p93j89IqOyYnBAwGAg8uP9SUJePWjIYXLo6lbbavvw2+AVg5ChwTOlaklGdvE+GNW5jg8EsGXQD+vxZRGfjfUNTioWZgUdrZe0Cpy2h+txJ4xetziun24HjLoTFJZT9ECqQz+F71VS9B4ifowLZr04KwSrSrp8qLUS3cx7tFJo4hOxZuCosA+bfrmNUcl8LyhTelcJgLd2dqbxkqM418K8jIriPXrWGbNQoA=='
    },
    semiannually2999: {
      price: '29.99',
      paypalPlanId: 'VNYPF7G52T3PE',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtZHpb8YyE3xsdY3MVDVT9YgK7X6d7mRnZyw825efE8zrJeEgbJufPC7jsYG57ZDXuAet14NbaXEs0qM8nO7gkUwsOY9sj/+m5MnOMOgJVRDAk1Tf0Rl+HU7YyJ37oemvdNACuDmV9fz5HTFo25aMp2rz4kgEb3G/M58kjgpAJcX+Lt+oGEnIj9cIi6j9VKgqxHYErHUAYFz873VEHKHWnf4TPNcQ8BbN1NPl+4RB1Fc5LiId1xy+2w3tb23PHIqmErt4CmTr9nEUfPHEXoSXT6A=='
    },
    semiannually3595: {
      price: '35.95',
      paypalPlanId: '388U2MW27SAR2',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtxVJgra/DBdsHcMVHO6y/Xo19USETytMy4+diUIKWmNRjJSV6TUXFrzISmkm8tBYP6XMx4eOtAOthKPEVBV+JUuG3a4k00dm5m3rODYBqp7oAIe2BztggFp0F8m/OWpD+gAKu90KIOv2vzmmPn3wQkQ9+lEpf+ECQm7UmqdZXc1MTblX3cwfIjCZZe4rvy+se+zxb76YnHkmWAsdoQLtKK70nRXSyNBMFx7THXeGo9fuzGdgW6pBtVmU43cLCLCGucDas+jiNf6yYlwF+ioC0Dw=='
    },
    semiannually3599: {
      price: '35.99',
      paypalPlanId: 'SRUHN4BCVT8RJ',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtxVJgra/DBdsHcMVHO6y/XpZO6R1XekqbGjkUaCQs+u4ITKNfBjfCDfI9/RDLmva5eYP3fsK/M3wnRj1TQXIBjIvE7xb/5unRZnqrGK69DdL2F6oBpVa06Sm6nBDomsUSoQIsiT3xxpRIQ1GUBxe9i9Wdq0wSD2k2DJgtD/W6vdAk6O2W9uiAPhtd0/uOMALn1uskmEIhpQMExzeEpmlj6u3NIRvDx1v8c+sElXorIZQ6WZ/qFDH18YWMehKX/f2G5L3UZ1Q55zx4mSJTEZS6NA=='
    },
    semiannually3995: {
      price: '39.95',
      paypalPlanId: '9HM7L5A5E9V7E',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtFJ2NPyTkp89loLKXjv9tlHUsdMYL++qIOAHUK5uXEIFXNTScPGUmnpqntSSn/jWehbCjUmKS1u92iXYYrS1Ddc6xm6yd/MbI7VI+QYJB6bYTEGGx9Oy1KvSIIA+05PkWutoSMdT79YEcMLPJeeZVsd8TJppeKwMGoEkpn9WhA11sIT7dGFyt9FhY1DDKyLXS5Vdxf6g+Isd15YXrESEGwrwwSQApjObp162eum8UNd7qLRHPSbXGRWZsBt7kEv6YucMD9S+kiI8hOnY5l1ce0A=='
    },
    semiannually3999: {
      price: '39.99',
      paypalPlanId: 'NADZ6UX36MWS8',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtFJ2NPyTkp89loLKXjv9tlAgITVJ02MU4ZVT2WjIFdrBIJHao6cMrR0A/bvQd4D77Zbt0u1UiTlXtDuj2F5XJDq7FHAIXyjbBzYTbT5s1pcNaWrZJtFECeEy+S+1uelmy8Md2q+plYxq/0c+hoBQrK3PFbIsDiueQGzCsduVCOZTlfHQRSuFw2SzTY8J5pgU4Hc+5zj1lQB3Q2Gbq/AkVsOltqNef4DSsfifQFrJPV7WMQQjDtPSjA1OzslAFoLsAXKWEwi9aG/YopxlifBmVVw=='
    },
    semiannually4200: {
      price: '42.00',
      paypalPlanId: 'X2FK4838HPCJC',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtVx6cEvkF+um2IYkK5hLpg7pV3//IaAcv3BmQrKVQq57fhxmJxDEcB9YQD34TBKJMN4HBaAulPCzjbydG6p+idrdlmOJgvqJpe7RkslU/JMSum3QAq2HHu6jptjKeqAdTyL3jlSO3xYC3Lo7Vc2yeBDbQ/YKbMlAEFAfWzcRhBT8HyveXCllF+E+T9K8JctB5vsBPk+1K5iQgl+RsUzo+48qvggrC/uX/4DTcMJQElr6mmNZvLqV7rWkP7ej0nypMXaIaUpfyuTx/Vk4ATrHuPQ=='
    },
    semiannually4995: {
      price: '49.95',
      paypalPlanId: 'VT2RM4TBFY6TU',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtDS/F26i0acDX6vdFFVQX2pAfFD73BVceSWjaS2XKmUseLd3rZD0kgJnzCtW0iJzNGnc8la+1w5SmBdxgn0uK/AJ12wb9Mn6oPSUayNQyoTaLeBC9PpLfkPc4snazQxBCcXH2Gu+gsetZTsdNui2oQuW7QOyv3oYmbx3pecOkwiqPH7bnsMJdbgDiFe434MZbGFXl1/W6PEL5hfm8WswddmM9/rPJ8sgM+eXebizEcXQXsAI/GWxQIvDBBUsqmXJ9HXf+xpA5IurAGI9l95Lh3A=='
    },
    semiannually4999: {
      price: '49.99',
      paypalPlanId: 'TT3RM5NBVQMJE',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYtDS/F26i0acDX6vdFFVQX2mzE4doWW0X1idb851OUBozTIi9j/35HtuT9mciqh5QuR4kLprC5/H3YZHeRvT1i88t3Fy7QQlIkS4h/F99zqCsHISaBvJoa0Y1GaUqpMBslt6F7VGhlwHeXzBiKCS7oSVIyKAsamkIfFvPX5vG8ieB57csLVllnGGzoKYiibr6G4D70jRhrAYQirc61Nzv+5uHQsHtsqtAM63wSCZO9bEAEb+YjclZ4NQCbdvxx23hYDckR0iuK997ib0dvOVL8eA=='
    },
    semiannually5995: {
      price: '59.95',
      paypalPlanId: 'LVPRFLQ7PASR2',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYt93q6KVJg8T/AIlYNC9zvdl7deJT95N5/10zjeSqQha+b/bSsW/XShwF4FTJ/qs4mxbpQRPK83K2DnnKfB1ifYbG86FBaCdaoMVZdtv2Q0gfyE0NZSTKfHS6olakbEF5uPXKnuaEfB4Gkt/3ZDjZb3g9x9J7W0usNe6wI1jSwo1nky1AxyUH/kz/+brpnf5OCXm0X6x6tzF/6c8aVgwWRyWX+FY83r0SMSL5tMaOdYiyiBq04VZx+Wpr2LMsVEnNwzCcdP2VcV5lyB6sH4ndFng=='
    },
    semiannually5999: {
      price: '59.99',
      paypalPlanId: 'KKX7WFPWUU78C',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsI9crWiSZSGLIdAusz0YiYt93q6KVJg8T/AIlYNC9zvdhSh5VfMieQZIz74EvgbEG2maiD7ztTxaxwtTG42uM006NIhr0Ee7DqVz+Un8loURscdwQWi56Fayesd02gb8zHK7kkbBxz1bEcCcOXqnhrZieR9OZTTppja6NdroVUwUHDZi+OtL6lk2X7tF9+cbIGrkvG/iTQWOJcOSGPbFqHM9VNttVq3DwuwaAY5g8CDTuTpVBTvV6XAsHPIzRUWmbI+RmpMHiwjfd52aD17rd/veHbuA2czh18af1/cAgOj7g=='
    }
  },
  annually: {
    annually3995: {
      price: '39.95',
      paypalPlanId: 'DLKCXWRBSHUCA',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUFrLejCF6R4MBdV54l7aUEJPmUty9HgOwnoXKYUKKrj8AOOXBxiNwxnieX/BirmuXdRDlEk8vUqX7rCQTJvd/Qy5qNFcC/it5Ss6eacYonyg3dnV5fsxe+bKp+LtC1Q/7ynVpDiTVgZkJgkXa+4DeHxusayaWpKSo+cwtpBDX0C6zzFZ+GZ0YQS0qnOZupWjLc4AiFvHyRdkT9fU0AIJzD1tl4ZlAz9HeVZ3UNadKbwG2tyzbueNEHqNxi8w9K4bIvKAunV58+nqivMrQjogy+g=='
    },
    annually3999: {
      price: '39.99',
      paypalPlanId: 'U7RKP76CYUEGG',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUFrLejCF6R4MBdV54l7aUEKAzGibFF/r+SC9FG0uDaCg2h52Y16AVawGgbk5YFLyzrtHMI1cdmIjG5rqMcOlVQoRwn06jmlHGtd0WvxRJXW8le10o/OXPdoAgbrpGvYaohqMIoHFHx7GWUdQ39a9uAnn6LsgqMDLepPvH4b3K3fF9Z4sAmg8CKntbfsIf1v3C6W7ugU2qeQ0zpvHymt7TLF6Ww+mU1pddcrokGDR2nQ2EbelxK0qamwUH1oNnPgnFA1hnYYCR7RsY8fLEKImtvA=='
    },
    annually4995: {
      price: '49.95',
      paypalPlanId: 'MD5WBRJVJ2QAN',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbU3HF0T8CnSSWVNKlrFdFtkwodCHz1haCx7UaazWHwCe7jy886Xi2S2N3zuB3+4iVi6XWCiUg7MkElYxemzQSmfKzw2i0otvluF8VAzPbQBx76d1gTFL4cnKqH+cWImSTg73MaCgIFeLcjqyL3EaLOfOULKrkL9RitgflsAfcFTmojILsBWlZnL8AuDTav+tLLPCVNN7AEl18Je5OAZC9r6JbhZ8+uiYn1EVCT0FP+375wRzbb3sp9z9XjcmlGufJzFy/zFTBjqghR2yZEeelUUg=='
    },
    annually4999: {
      price: '49.99',
      paypalPlanId: '7LDMJUH9NGSEQ',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbU3HF0T8CnSSWVNKlrFdFtk5uspjGdZDYc510Ox8hdhj2A45yHsfWcw++Ep0s5j8o/OfZhLCSIGz0b7y9OIUFEkw+AjGQkjxsjlYjCqYELT3irmFzYmZ6vHZBhf2xZH4TI3kpu34K9IHEQJ4uwIhc28OeM1Ht2MHfoP8DrD5tAymJOzHppMHEYCmxWUQOwRtxEWF4acQmPe3CJDl2n/WVMBwPLHFpDVqTiTFEw62WSLqzh5mQIlZFhyB8DL4o5Ln94Z3dlmT82GJCgtBUstktA+g=='
    },
    annually5995: {
      price: '59.95',
      paypalPlanId: '6RNSYH9HN3N48',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUj3ht9RTyDEthrrb7x47eEIqxUX9EukENA5U5lYUtUxVdvfxG17tQkpSqdpwrUhaMUEV5lnKVU1DTpPdUHBLJvRikGcY0SFnVYT1CNCY4IDw1on2tkPVs50u7mNqtl8DZzGWbJYEej/ei48to87+siKD6ty3Wv62wtGIiISN8OH7z0NpCqS3JS2cZnj9PPvKeqXp957k9YReuJ0HIfpFtqcDG7iVzXJcZnF3PzlRw4bghgTE78PIH1+Ey3EY/EJR1si6hOJ7sFTe7arVLoxQTlA=='
    },
    annually5999: {
      price: '59.99',
      paypalPlanId: 'MXZJ563H6GFM2',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUj3ht9RTyDEthrrb7x47eEJvv3Hxq0qrR+3KiBjTmfEDorgNtDp4ZaBohxhpPwvb4VG+eyLma/9dj/qFelktjEaVdmCHg8vY4BygvRYqX5l3fawgj3Hj7HSMsemoQD9QhtKrox3j7kVCvxVb9CYoV+8XIUTeXsyB9CLoeB5McHEdG+awhLZUfsn5KcBAJ/DXtdY5y4NrSrJUgLdb93GrlPo3R6YB4RXeFudx8//kQBL2CcJ0vq0Mrn3qISE3Er6RaeLOkQGipNjMrkIkQuvt9XQ=='
    },
    annually6000: {
      price: '60.00',
      paypalPlanId: '9ASJNWJCCJGCC',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbULGIcNxmaZYmkJmEszv29UmPMHpCt0Z1Ih1xdO3PsbR1rvtohF+a47Id4kAn2yn/Cx0W32dSIUh21Xhc99b0W/KHSI/XtxAvo5nLSXOFiBwqtHVE6YFqi5KYB4Lq6h3rxdrGdeioyqpCQx0BGwK3ALld9MpPd3e25uAEy1DvCCgRMg+acfLScNZ9rHLG7K2E4EvDQ3VpNqXoclspihmMqHb9STE7QrdQetXgpNyo7VvO683JafMHGRceU1d4i8vf78H5TwxJ3oBYtNcTd2C3SoQ=='
    },
    annually6900: {
      price: '69.00',
      paypalPlanId: '2QQP8LJGKMW66',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUbV4IJ9iGsBcNoKb464ejCfjXZBAHMuxM1rr7zfemNHJTbrp265CwdPLhwC0ESWKM9L5ZGQLD9XRbJEUtflj0YIT8V3E0wuGRJCTHx86p0ATT0bawWsXUOblqfKrBSR+J7il8P9Y+ZzOwmsBgM0zfr3jQyl3fFqBVEVqojkQG2OnH5nnXMvonhv9A1wpLzzpTgR8tmqujEdi6iIWMSOqaMFoiMC/A4iGwmt4HSvVOP6EHrLdc9rQteIUdoFyNJDzrQUm2u1NGj77quwRZlZ5p4g=='
    },
    annually6995: {
      price: '69.95',
      paypalPlanId: 'SA2MMZWPSJQRC',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUbV4IJ9iGsBcNoKb464ejCRXpIQuiuY5lGqj0XV5JJah1HkE92ordr21L/+Ijqjju+QTQmGuflmpD1xobKOACtqR8+bd/drBy30w4EyKkhfDGjcae2eih3GjQdF98p+awmdQaGKa/CKRtyZnyArzJRo/gcPIAE/13bsJz1GiC49mURjM7T5k8miQcz19D7ENbW3flnh+o7hywPgYgzrdGFh6dlkMmBx6SiSD0GDYiKGJmVMoX3Y8epHr7PfVClAePOomtYIZvLpGo91isA3YYnw=='
    },
    annually6999: {
      price: '69.99',
      paypalPlanId: 'JUNSZ4PNVGZ7S',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUbV4IJ9iGsBcNoKb464ejCdye/jZNsA+fuKAf6WEUDsT9U6GtTfxEhbtSJv/xLMhsqlGFf9AvHdQ8qH6lHDyXWpKmM4BiIDJpHmNT/FkO6YZbq9SjIu1qeOvIqUaqPVJEIQ5bHdecdgGfX3IkIXrin8Vh9H3r0FvQpZTXp7LtwXjCq7tomHYfLOIXQqs80NTO6/QXBVGXgTHhTzeLWw9sItzO62BJimx6l5UPVTGyTqR7M7E5gn744S3XwwGitlQqcl23M6PD/5QWG30EGhZGGw=='
    },
    annually7799: {
      price: '77.99',
      paypalPlanId: 'XZSADFZ6LQBYL',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbU1wkAEMYCaKYMXAdiUYBtm1TnKKpPuLGx1UCOO1dTAmaRn2RktEt/d4AExDrXIpifXddlvdQUGTsML9J1ubEZ+22k0Dc7GxgHX46cTSp/cplW8NSKJ84pbUelJ34JOwXpEAh8HMkomKXV4ASkmPooruwFTy1IULOR4PW+sxETcpFeXf35OJkFf07CxCzjLg2Ag1ydVdxmsSk/6TVD4t0ITtP2SdlrxIxYgW1woBRU1ARUD786OmmLoBWAU8nB4utm5L+Pfj7Diaqfv9lFkVqlfQ=='
    },
    annually7995: {
      price: '79.95',
      paypalPlanId: 'XSBFCMRD8T9EY',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbU5IYfS4gRWcFQriinHBraHwNORHNlmQz6vDG0A153u61FkWC8ofS58gJmoBx2iEFVyT3KxtRiD9ZFBgKL8QWqVEYWRdIO8YRlYFCALeQhHW6ukjuJPf0vuLRE4Z+G5r25RkdwjVoh1HCyhRiC6y/UR45U1QyVvy2oZf2GCLOZ2nWSDWvCkAPimFGj6nafBE6q+/iLWTwRurp/FN8uXmWq49U5KG4a0GZQ+2qljsxJtSn28aD7rGDyfGPe4PGH2LtO1EWtHqKPTHvwCkRkw72U5Q=='
    },
    annually7999: {
      price: '79.99',
      paypalPlanId: 'W2XGJPZ4BTRC8',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbU5IYfS4gRWcFQriinHBraH4mn575Eqs6bJKHm0e7FvEQ/h5ubdvoUAsQlfFEdEdNE2qw76pTxMF6PZILYUEzsia/f0gVaKU5x9XarPb6DYHO1duD7gf8qNN1nZ6PCOHpqdftKxbddixSk/U+Cx9ipy4dG+cI/DKg0ZAVST10UoNAgu4/tcmxOax6Z1qy79jJyLFZk2sryCpJwuTD4dkisSkBh2HszOs3WNUCXA7BAmVm7QFVanJV62+gtYzSACZJqhd1o6BiRcsOiuHytrhUdQw=='
    },
    annually8000: {
      price: '80.00',
      paypalPlanId: 'X9TW9KB8CTGXA',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUfyLig74BvSWpGIpRwrQIcIlaay6L/TdybD7PdqhOvkcuU9CjUn3vE1rgEgAJ+GpSaqQEmrP9n4etbINEsU2Z1rAJVZPDe16O1GxBWo1mOGxq2uoMRBFynmw/2Z0JVyY1sGNW+xmC01sK7W60uPrUsHWsrInvAgaJkYROa2+Jd2TLWdlqRlJ+LjrGezjV8GxOOYpx1FMHTrkb4Dz185QeJKiRGmSFw+hAE7jxEGeMcCqTy70SRLYYe+K8XImmacXebWEKGhctwbzqVmlVoRdhPg=='
    },
    annually8995: {
      price: '89.95',
      paypalPlanId: 'W6TY2P36QEYCN',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUULdrUUxbmsGDBghSEDuB11mbVUsPHNlJf+1hzxf/OmUjMT/dPcvPs7b7a1yt5wXIk4Ucg5fKH0DIm2PXcrLict+LOUufMgPvzOupjwh/pJOR2uzTy3V/+PHsbQX+mPC/kZtZBcoQkZMdkvdb9LWwrYQXDrx3xSG49JQcavtEVVUMtCGqnLsKKM2G5ncWXFV1BIt4Ot1/UpTZpv2hQF7QwM1vVwpH5Q/Dh6uJtrurc/wz1hM2M12XF33r7W90u0ibWGK2TET2lnTO1F9suQtBlA=='
    },
    annually8999: {
      price: '89.99',
      paypalPlanId: 'UNC2Q5HQ9678N',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUULdrUUxbmsGDBghSEDuB18BgUr8Q5IcyUIa88aAbL3qwWbQ1+AJ6Rtx25M2cYubEvBQYsbpor6j9Eutuk7ZlCgEZ7rBLMLdk8EMNv5zdlWbMb4TxCjigIYpJNofBO//WQF/rTblPdWJA5pWOBxCtv9b3fYl31sGRMSzUpfIPrVYeHUcw2+q1D07x68d7bSRaQdMipD9Z5M7rvBvX0TvPMByTA1WJZD67gWcYwiZ/+yISFd4yW1sWUKVgGcLvDr/7byDNZdqpc/6Jnu9nociWQA=='
    },
    annually9000: {
      price: '90.00',
      paypalPlanId: 'ZJR8GEEWLAQRC',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbUgn+UC6hvIL87LuQJRrtu836Y4416ZpnS3H5nyzLfptdk1KBxJBNb4BT24xbHNbUTUS7Jzcl14T5CcM5bJEuLS/MCT1s1IHGcSkRt2X64yagSqeBB0hteHkw3TY1Q1bOKDXj5F1RNbLfPAXKt9A513KSUgjUJCxkwb11fUkxiwEB5tRrhMT4zy+lVwGQX2KfDXZYgYlfGxkblPDzE9bowVvWwug0SEx2WwRsuymZigX1kD2dL5GfhrK4WknLlQXThgpBoecIInG5SDRiJZ5cHyw=='
    },
    annually9995: {
      price: '99.95',
      paypalPlanId: 'SU2MFEU4TGLFN',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbULqDxp3V5QNqf/RjFzpPrM6vAD/uYY+NeXBp8GFNaO/yKbsToqwCgjVQ08NJp8h0UjXI5RjGblj1brv0f2a2JWE/YzgdviSL/lq7YBRpOdoZivFCsihJznI/ubf5Ew8pfly+f5icDiz53zcC65bKYYmMzOZAiM4KplUrgOCuAKgQ5mUxhBTZ+A9hr+nsXfjg9xdSWG4tN1b6XGWJ097tTvIbunn4HfQ4bZyE6SQaElqZgiHehUb9zT+rAgQwsZX3hOjB9ZQKrdu5rriFeTv0ibQ=='
    },
    annually9999: {
      price: '99.99',
      paypalPlanId: '2JSHKC4RACBMA',
      bitpayPlanId: 'rDNH1y1QGetIGfRuWqjAKXLfg/M+yFmdEmL6jDfljpyiMifqDnitepwtuBM1XWsMjPjdWULKmlk0BXobcfpM9RBG2Byp1YXm0iZnzepYwsK9bHfltA8K2NL6zllPKIbULqDxp3V5QNqf/RjFzpPrM0mkCE24s7FvJACp3M9PlCCD4gxply9osc9cjd3MnK+7yoF439gga4ymUApLpblTLPOAn4Xxc0l1RNKvoEm18FgQyLbYyc8vCTjzyfgJoGLaticu631otYgJJskMNt78Eu+QV6qI7g2zosZmioZRAT01Gq0YSddPTmaPa4skn/HKqm/3HlFgFnDouFrGOJI2yUlHihKa9wZn42Yh0NRD6m2hvTJCoFZGZO1gHqAu4LV08vmIojaNHGc8PPAOtMDEbA=='
    }
  }
};

const plansTest = {
  monthly: {
    monthly1195: {
      price: '11.95',
      paypalPlanId: '2Z9YV6M55688N',
      bitpayPlanId: 'm11KRs736FeBMFoMeoSllMbhydqlxA3KrtlO8usqz+WGoLd0HymdBiKlc0x4/1QienTfpxnDWUJLo2RbLWXWYuVb2fIPUK1HC2gn83bhLGRqE2aWA08OdoVxsASvSGDY981jOkDDUjghm2TUKp9MM/PCOVSxt+IfSnj8MYN6a1BFnxB+kZBC6GDdbbDxzWaziCU0kPf02/To88EpEQzx94Fbnqk/pa71Q6O5MdQFOEl3jKIrUS9Ov8qKbWe/BVkmUdWdlWSjXKWEV8GWaCx/uMcdC4xwnYul/WjNHI42g3goqrwbInLAOqJPbDalzDY5uRp2AAvngOwP0+x/07EnsA=='
    }
  },
  semiannually: {
    semiannually4200: {
      price: '42.00',
      paypalPlanId: 'G7ZF7Y99PQPML',
      bitpayPlanId: 'm11KRs736FeBMFoMeoSllMbhydqlxA3KrtlO8usqz+WGoLd0HymdBiKlc0x4/1QiCSdoP9NUTcX3Q+kPsB43Na1VYJ/Bb+VL3c0dkglQUUn/dEBNG+hcmActW+edqE2XoF/0p3kv5NA0riDFtwyyWw/k0RTjWN14WJy9gdONXxpdlia2Vk80y6PyAqhQB30ycCv3iz8gpwrvUUpo1CdPiDUlIPU5I20F/itOmYYd7P+6rSlAPCo/M88UEVM0WYxuR1MWVDUZtXzmdB7ZopZikESCRCzo5FVtWtDp4bZJY2seT3elij2LYGbSegtXpYFMYwm8OxXQRYhrxXVQWFrcxQ=='
    }
  },
  annually: {
    annually6900: {
      price: '69.00',
      paypalPlanId: 'EH8JJTZLEXAWS',
      bitpayPlanId: 'm11KRs736FeBMFoMeoSllMbhydqlxA3KrtlO8usqz+WGoLd0HymdBiKlc0x4/1QiyO/0ITRZgRbsNe5mvEeDsng+MWd6NzyPtJCGP88yvqXIke/rJvfbJRwLUI8iOrvq0aIr805ByWFcpx5yQ9yufXcPjmsGy/UzHOstS3YM0x4K0XwBQBhI1EjbWwVmNxW4/ESjikBgSfJQuI1yFxB0iTebwC32mVzXYkfS1CPL3oMfCjA7d+nk2/3piufuTFEdFxMDBDliVrDg5Bx/77HC0ZD+ugKqSQ61IAzw8I6aHrUjdR6zJz/jKNr6xiEG2qHU+Yx1VWmM1eLY8OTlykBldA=='
    }
  }
};

const planNames = {
  monthly: "Cypherpunk Privacy Monthly Plan",
  semiannually: "Cypherpunk Privacy Semiannual Plan",
  annually: "Cypherpunk Privacy Yearly Plan"
};

function applyIdAndTypeAndName(plans) {
  for (var type in plans) {
    if (!plans.hasOwnProperty(type)) continue;
    for (var id in plans[type]) {
      if (!plans[type].hasOwnProperty(id)) continue;
      plans[type][id].type = type;
      plans[type][id].id = id;
      plans[type][id].name = planNames[type];
    }
  }
}
applyIdAndTypeAndName(plans);
applyIdAndTypeAndName(plansTest);

const defaultPlanId = {
  monthly: 'monthly1195',
  semiannually: 'semiannually4200',
  annually: 'annually6900'
};

const defaultPlans = {
  monthly: plans.monthly[defaultPlanId.monthly],
  semiannually: plans.semiannually[defaultPlanId.semiannually],
  annually: plans.annually[defaultPlanId.annually]
};

const defaultPlansTest = {
  monthly: plansTest.monthly[defaultPlanId.monthly],
  semiannually: plansTest.semiannually[defaultPlanId.semiannually],
  annually: plansTest.annually[defaultPlanId.annually]
};


module.exports = {
  defaultPlanId: defaultPlanId,
  defaultPlans: defaultPlans,
  defaultPlansTest: defaultPlansTest,
  getDefaultPlans: () => {
    if (generalConfigs === 'DEV') { return defaultPlansTest; }
    else { return defaultPlans; }
  },
  getPlanByID: (planId) => {
    let currentPlans = plans;
    if (generalConfigs.env === 'DEV') { currentPlans = plansTest; }
    for (let type in currentPlans) {
      if (!currentPlans.hasOwnProperty(type)) continue;
      if (currentPlans[type].hasOwnProperty(planId)) return currentPlans[type][planId];
    }
    return null;
  },
  getPlanByTypeAndID: (planType, planId) => {
    let currentPlans = plans;
    if (generalConfigs.env === 'DEV') { currentPlans = plansTest; }
    if (currentPlans[planType]) { return currentPlans[planType][planId]; }
    else { return null; }
  },
  getStripePlanIdForReferralCode: (plan) => { // referralCode
    if (plan === 'monthly') { return defaultPlanId.monthly; }
    else if (plan === 'semiannually') { return defaultPlanId.semiannually; }
    else if (plan === 'annually') { return defaultPlanId.annually; }
    else { return null; }
  },
  getPricingPlanType: (plan) => {
    if (plan === 'monthly') { return 'monthly'; }
    else if (plan === 'semiannually') { return 'semiannually'; }
    else if (plan === 'annually') { return 'annually'; }
    else { return null; }
  }
};
