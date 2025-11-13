import jwt from 'jsonwebtoken';

describe('JWT Test', () => {
  it('should sign a token', () => {
    const token = jwt.sign(
      { userId: '123', type: 'access' },
      'secret',
      { expiresIn: '15m' }
    );

    expect(token).toBeDefined();
  });
});
