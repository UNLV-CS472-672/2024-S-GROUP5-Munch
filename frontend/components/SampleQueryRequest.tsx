// Sample Query to be used for reference (for GET)

import axios from 'axios';
import React, { useState } from 'react';
import { Card, Text, Button } from 'tamagui';
import { useQuery } from '@tanstack/react-query';

// const getPosts = async () => {
//   try {
//     const response = await axios.get(
//       'http://localhost:5000/api/posts/Q7LKx6ud2wToavm7fxLw',
//     );
//     console.log(response.data)
//     return response.data;
//   } catch (error) {
//     return error;
//   }
// };

// Function to fetch posts
const getPosts = async () => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/posts/Q7LKx6ud2wToavm7fxLw',
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    return error;
  }
};

export default function SampleQueryRequest() {
  const [submitted, setSubmitted] = useState(false);

  // useQuery: unique key for the query, function that returns a promise and either resolves data or throws error
  const handleSubmit = () => {
    setSubmitted(true);
  };

  const result = useQuery({
    queryKey: ['UniqueNameSpecificToQuery'],
    queryFn: getPosts,
    enabled: submitted, // Enable the query when submitted is true
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
      <Card.Footer />
      <Card.Background />
    </Card>
  );
}
