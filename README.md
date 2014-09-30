# burnchart.io

## Concept

GitHub Burndown Chart as a service. Public repos are free, for private access auth via GitHub and pay.

## Notes

- *payment gateways* in Canada: [Shopify](http://www.shopify.com/payment-gateways/canada), [Chargify](http://chargify.com/payment-gateways/) list; I get free processing on first $1000 with [Stripe](https://education.github.com/pack/offers)
- start people on a *Community* plan showing them a comparison table to upgrade to a better offering
- community (open source, local storage), business (private repos, firebase)
- keep discussion going via [gitter](http://gitter.im)
- [credit card form](http://designmodo.com/ux-credit-card-payment-form/) ux from Designmodo
- workers: using a free instance of IronWorker and assuming 5s runtime each time gives us a poll every 6 minutes. Zapier would poll every 15 minutes but already integrates Stripe and FB.
- worst case scenario I provide even Small Business plan for free and provide a better experience
- $2.5 Node.js PaaS via Gandi with promo code `PAASLAUNCH-C50E-B077-A317`.
- let people vote on features they want to see fast: [tally.tl](http://tally.tl/).
- use [readme.io](https://readme.io/) for documentation

## Plans

### Community

- your repos are saved locally
- no auto-updates to milestones, everything fetched on page load
- no private repos

### Business

- you need to pay for a license to use the app for business purposes
- repos, milestones saved remotely
- auto-update with new information
- private repos