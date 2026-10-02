import assert from 'node:assert/strict';
import {suggestTier,eligibility} from '../lib/ai/rules.ts';
assert.equal(suggestTier(199.99).tier,'bronze');assert.equal(suggestTier(200).tier,'silver');assert.equal(suggestTier(499.99).tier,'silver');assert.equal(suggestTier(500).tier,'gold');assert.equal(eligibility(120,100,1),true);assert.equal(eligibility(120,100,0),false);assert.equal(eligibility(99,100,1),false);console.log('PASS: rule boundaries and redemption eligibility.');
