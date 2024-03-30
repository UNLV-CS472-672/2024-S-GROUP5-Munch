// Sample Query to be used for reference (for GET)

import axios from 'axios';
import React, { useState } from 'react';
import { Card, Text, Button } from 'tamagui';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Make GET request with axios
const getPosts = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/posts/3xUM3gtEQMlaYJjNA0qY',
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export default function SampleQueryRequest() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => {
    setSubmitted((submitted) => !submitted);
  };

  const queryClient = useQueryClient();
  const clearQueryCache = () => {
    queryClient.invalidateQueries('posts'); // Clear query cache
    handleSubmit();
  };

  const result = useQuery({
    queryKey: ['UniqueNameSpecificToQuery'], // Descriptive key to identify this specific query
    queryFn: getPosts, // Function that defines how to fetch data for this query
    enabled: submitted, // Optional: Execute the query only when the variable submitted is true
  });

  if (result.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (result.error) {
    return <Text>Error: {result.error.message}</Text>;
  }

  return (
    <Card>
      <Card.Header />
      <Text> Test query </Text>
      <Text> Results of query request: {JSON.stringify(result)} </Text>
      <Text> Results of query request: {JSON.stringify(result.data)} </Text>
      <Button onPress={handleSubmit}>Submit</Button>
      <Button onPress={clearQueryCache}>Clear Query Cache</Button>
      <Card.Footer />

      <Card.Background />
    </Card>
  );
}
