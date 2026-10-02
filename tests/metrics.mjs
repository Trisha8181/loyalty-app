import assert from 'node:assert/strict';
import {metrics} from '../lib/metrics.ts';
const base={campaigns:[],memberships:[{id:'m',gender:'female',lifecycle_status:'new'}],receipts:[],gifts:[],redemptions:[]};
assert.equal(metrics(base).aov,null);
const populated={...base,receipts:[{id:'r',member_id:'m',amount:120,campaign_id:'c'}],redemptions:[{status:'completed',receipt_id:'r'},{status:'cancelled',receipt_id:'r'}]};
const m=metrics(populated);assert.equal(m.sales,120);assert.equal(m.aov,120);assert.equal(m.newMembers,1);assert.equal(m.genders[0].count,1);assert.equal(m.completed.length,1);
assert.equal(metrics(populated,'other').sales,0);assert.equal(metrics(populated,'other').members.length,0);
assert.equal(metrics({...base,receipts:[{amount:0.1},{amount:0.2}]}).sales,0.3);
console.log('PASS: dashboard success scenario, empty state, campaign isolation, cancellation exclusion, cent-safe totals.');
