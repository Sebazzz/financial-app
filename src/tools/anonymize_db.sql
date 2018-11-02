  -- Set password to Welkom01

  UPDATE AspNetUsers
  SET PasswordHash = 'AQAAAAEAACcQAAAAEABsGPfw8aLQnTuFmVWaqgflqhSIEivgRx0NQcEoRUIAnx9eXy2zT8nCemZcXvh5Mw==',
	 SecurityStamp = 'ATZWAOO74ODKZKV27MTCB52GHWTHP4XS',
	 TwoFactorEnabled = 0

  -- Strip e-mails
	UPDATE AspNetUsers
	SET Email = CONCAT(REPLACE(Email, '@', '_'), 'dev-test@damsteen.nl'),
	NormalizedEmail = UPPER(CONCAT(REPLACE(NormalizedEmail, '@', '_'), 'dev-test@damsteen.nl'))
	WHERE Email NOT LIKE 'dev-test@damsteen.nl'