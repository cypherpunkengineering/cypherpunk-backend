module.exports = {
  makeStatusResponse ({ userId, request, user, subscription, radius }) {
    if (!userId && user) { userId = user.id; }
    if ((!user || !subscription || !radius) && (!userId || !request)) {
      return Promise.reject(new Error('Invalid parameters'));
    }
    return Promise.all([
      user || request.db.select([ 'id', 'email', 'secret', 'type', 'confirmed' ]).from('users').where({ id: userId }).first(),
      subscription || request.db.select(['active', 'renewal_timestamp', 'expiration_timestamp', 'type']).from('subscriptions').where({ user_id: userId }).first(),
      radius || request.db.select([ 'username', 'value' ]).from('radius_tokens').where({ account: userId }).first()
    ])
      .then(([ user, subscription, radius ]) => {
        // Handle missing required/optional data
        if (!user) throw new Error('No such user');
        subscription = subscription || {};
        radius = radius || {};
        // Massage the returned rows into the expected format
        let subActive = subscription.active || user.type === 'developer' || user.type === 'staff';
        return {
          secret: user.secret || '',
          privacy: {
            username: radius.username || '',
            password: radius.value || ''
          },
          account: {
            id: user.id,
            email: user.email,
            type: user.type,
            confirmed: user.confirmed || false
          },
          subscription: {
            active: subActive || false,
            renews: !!subscription.renewal_timestamp,
            type: subscription.type || (subActive ? 'forever' : 'none'),
            expiration: subscription.expiration_timestamp || 0,
            renewal: subscription.renewal_timestamp || 'forever' // deprecated
          }
        };
      });
  }
};
