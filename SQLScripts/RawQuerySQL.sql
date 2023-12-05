    -- Check the rank from the selected record to see if there is a record 2 rank higher than it
	-- If so, get 2 records before it and 2 records after it
	DECLARE @CountMaxRecord INT
	WITH GameScoreTemp AS (SELECT sg.Id,sg.MemberId,sg.GameId,sg.CurrentHighestScore,sg.StartTimeGame,sg.EndTimeGame,sg.CampaignCode,sg.MemberName,CAST(ROW_NUMBER() OVER(ORDER BY CurrentHighestScore DESC) AS INT) Rank FROM GameScore sg WHERE sg.GameId = @GameId)
	SELECT @CountMaxRecord = COUNT(*)
	FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank+2
	WHERE GS1.MemberId = @MemberId AND GS2.GameId = @GameId
	IF @CountMaxRecord = 0
		BEGIN
			-- Check the rank from the selected record to see if there is a record 1 rank higher than it. 
			-- If not, then that record is the highest rank and get the next 3 records
			DECLARE @CountSecondMaxRecord INT
			WITH GameScoreTemp AS (SELECT sg.Id,sg.MemberId,sg.GameId,sg.CurrentHighestScore,sg.StartTimeGame,sg.EndTimeGame,sg.CampaignCode,sg.MemberName,CAST(ROW_NUMBER() OVER(ORDER BY CurrentHighestScore DESC) AS INT) Rank FROM GameScore sg WHERE sg.GameId = @GameId)
			SELECT @CountSecondMaxRecord = COUNT(*)
			FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank+1
			WHERE GS1.MemberId = @MemberId AND GS2.GameId =@GameId
			IF @CountSecondMaxRecord = 0
				BEGIN
					WITH GameScoreTemp AS (SELECT sg.Id,sg.MemberId,sg.GameId,sg.CurrentHighestScore,sg.StartTimeGame,sg.EndTimeGame,sg.CampaignCode,sg.MemberName,CAST(ROW_NUMBER() OVER(ORDER BY CurrentHighestScore DESC) AS INT) Rank FROM GameScore sg WHERE sg.GameId = @GameId)
					SELECT GS1.Id,GS1.MemberId,GS1.GameId,GS1.CurrentHighestScore,GS1.StartTimeGame,GS1.EndTimeGame,GS1.CampaignCode,GS1.MemberName,GS1.Rank  
					FROM GameScoreTemp AS GS1 
					WHERE GS1.MemberId =@MemberId AND GS1.GameId=@GameId
					UNION ALL
					SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
					FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-1 
					WHERE GS1.MemberId=@MemberId AND GS2.GameId = @GameId  
					UNION ALL
					SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
					FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-2 
					WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId
					UNION ALL
					SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
					FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-3 
					WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId
					UNION ALL
					SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
					FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-4
					WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId
				END
			ELSE
				BEGIN
						WITH GameScoreTemp AS (SELECT sg.Id,sg.MemberId,sg.GameId,sg.CurrentHighestScore,sg.StartTimeGame,sg.EndTimeGame,sg.CampaignCode,sg.MemberName,CAST(ROW_NUMBER() OVER(ORDER BY CurrentHighestScore DESC) AS INT) Rank FROM GameScore sg WHERE sg.GameId = @GameId)
						SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
						FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank+1 
						WHERE GS1.MemberId=@MemberId AND GS2.GameId = @GameId 
						UNION ALL
						SELECT GS1.Id,GS1.MemberId,GS1.GameId,GS1.CurrentHighestScore,GS1.StartTimeGame,GS1.EndTimeGame,GS1.CampaignCode,GS1.MemberName,GS1.Rank  
						FROM GameScoreTemp AS GS1 
						WHERE GS1.MemberId =@MemberId AND GS1.GameId=@GameId
						UNION ALL
						SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
						FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-1 
						WHERE GS1.MemberId=@MemberId AND GS2.GameId = @GameId  
						UNION ALL
						SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
						FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-2 
						WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId
						UNION ALL
						SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
						FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-3 
						WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId
				END
		END
	ELSE
		BEGIN	
			WITH GameScoreTemp AS (SELECT sg.Id,sg.MemberId,sg.GameId,sg.CurrentHighestScore,sg.StartTimeGame,sg.EndTimeGame,sg.CampaignCode,sg.MemberName,CAST(ROW_NUMBER() OVER(ORDER BY CurrentHighestScore DESC) AS INT) Rank FROM GameScore sg WHERE sg.GameId = @GameId)
			SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank 
			FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank+2 
			WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId 
			UNION ALL
			SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
			FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank+1 
			WHERE GS1.MemberId=@MemberId AND GS2.GameId = @GameId 
			UNION ALL
			SELECT GS1.Id,GS1.MemberId,GS1.GameId,GS1.CurrentHighestScore,GS1.StartTimeGame,GS1.EndTimeGame,GS1.CampaignCode,GS1.MemberName,GS1.Rank  
			FROM GameScoreTemp AS GS1 
			WHERE GS1.MemberId =@MemberId AND GS1.GameId=@GameId
			UNION ALL
			SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
			FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-1 
			WHERE GS1.MemberId=@MemberId AND GS2.GameId = @GameId  
			UNION ALL
			SELECT GS2.Id,GS2.MemberId,GS2.GameId,GS2.CurrentHighestScore,GS2.StartTimeGame,GS2.EndTimeGame,GS2.CampaignCode,GS2.MemberName,GS2.Rank  
			FROM GameScoreTemp AS GS1 JOIN GameScoreTemp AS GS2 ON GS1.Rank = GS2.Rank-2 
			WHERE GS1.MemberId=@MemberId AND GS2.GameId =@GameId
		END
