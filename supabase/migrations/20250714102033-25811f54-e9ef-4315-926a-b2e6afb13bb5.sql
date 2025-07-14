-- Create likes table for strategy likes
CREATE TABLE public.strategy_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, strategy_id)
);

-- Enable Row Level Security
ALTER TABLE public.strategy_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Users can view all likes" 
ON public.strategy_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.strategy_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.strategy_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to get like counts
CREATE OR REPLACE FUNCTION get_strategy_like_count(strategy_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM strategy_likes
    WHERE strategy_id = strategy_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;