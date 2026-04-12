#!/bin/bash
sed -i 's/Environment.Production/Environment.production/g' src/app/api/payments/subscribe/route.ts
sed -i 's/customerEmail:/customer: { email:/g' src/app/api/payments/subscribe/route.ts
sed -i 's/user.email,/user.email! },/g' src/app/api/payments/subscribe/route.ts
