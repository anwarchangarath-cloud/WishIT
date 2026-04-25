import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { keywordScore } from '../utils/helpers.js';

const matching = new Hono();
matching.use('*', authMiddleware());

const CATEGORY_SKILLS = {
  Education:   ['teaching', 'mentoring', 'tutoring', 'education', 'coaching', 'training', 'academic', 'scholarship'],
  Health:      ['medical', 'health', 'doctor', 'nurse', 'therapy', 'mental health', 'wellness', 'clinical', 'healthcare'],
  Career:      ['career', 'business', 'entrepreneur', 'management', 'leadership', 'strategy', 'consulting', 'hr', 'recruiting'],
  Family:      ['counseling', 'social work', 'family', 'parenting', 'childcare', 'community', 'social'],
  Community:   ['community', 'nonprofit', 'volunteer', 'social impact', 'organizing', 'advocacy', 'outreach'],
  Creative:    ['design', 'art', 'music', 'photography', 'writing', 'creative', 'film', 'media', 'content'],
  Travel:      ['travel', 'logistics', 'planning', 'international', 'immigration', 'visa', 'network'],
  Technology:  ['software', 'programming', 'development', 'coding', 'tech', 'engineering', 'data', 'ai', 'web'],
  Other:       [],
};

matching.get('/dream/:id', async (c) => {
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Dream not found' }, 404);

  const { results: fulfillers } = await c.env.DB.prepare(`
    SELECT uid, name, trust_score, verified, fulfilled_count, skills, interests, causes, location, country, bio, fulfiller_bio, mode
    FROM users
    WHERE (mode = 'fulfiller' OR mode = 'both') AND role = 'user' AND banned = 0 AND suspended = 0
    ORDER BY trust_score DESC LIMIT 100
  `).all();

  const catKeywords = CATEGORY_SKILLS[dream.category] || [];

  const scored = fulfillers.map((f) => {
    const skills = safeJSON(f.skills, []);
    const interests = safeJSON(f.interests, []);
    const causes = safeJSON(f.causes, []);
    const allFulfillerText = [...skills, ...interests, ...causes, f.bio || '', f.fulfiller_bio || ''].join(' ');

    const dreamText = `${dream.title} ${dream.story} ${dream.category}`;

    let score = 0;

    // Keyword match: dream story vs. fulfiller profile
    const textMatch = keywordScore(dreamText, allFulfillerText);
    score += textMatch * 0.4;

    // Category-skills alignment
    const catMatch = catKeywords.filter((kw) =>
      allFulfillerText.toLowerCase().includes(kw)
    ).length;
    score += (catMatch / Math.max(catKeywords.length, 1)) * 30;

    // Trust score contribution (max 20 pts)
    score += (f.trust_score / 200) * 20;

    // Verified boost
    if (f.verified) score += 5;

    // Fulfilled count boost (experience)
    score += Math.min(f.fulfilled_count * 2, 10);

    // Location match
    if (dream.country && f.country && dream.country.toLowerCase() === f.country.toLowerCase()) {
      score += 8;
    }

    return {
      uid: f.uid,
      name: f.name,
      trust_score: f.trust_score,
      verified: f.verified,
      fulfilled_count: f.fulfilled_count,
      location: f.location,
      skills,
      interests,
      causes,
      match_score: Math.min(100, Math.round(score)),
    };
  });

  const matches = scored
    .filter((f) => f.match_score >= 15)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20);

  return c.json({ matches, dream_id: dream.id });
});

function safeJSON(str, fallback) {
  try { return JSON.parse(str || '[]'); } catch { return fallback; }
}

export default matching;
