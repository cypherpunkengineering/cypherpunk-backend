module.exports = {
  calculateRenewal: (plan, date) => {
    let subscriptionStart = date || new Date();
    let subscriptionRenewal = new Date(+subscriptionStart);

    if (plan === 'trial') {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 1);
    }
    else if (plan.startsWith('monthly')) {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 30);
    }
    else if (plan.startsWith('semiannually')) {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 180);
    }
    else if (plan.startsWith('annually')) {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 365);
    }
    else { return 0; }

    return subscriptionRenewal;
  }
};
