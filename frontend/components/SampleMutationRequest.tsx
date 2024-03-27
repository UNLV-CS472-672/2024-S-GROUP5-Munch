// Sample Mutation to be used for reference (for POST, PUT, DELETE)

import React, { useState } from 'react';
import axios from 'axios';
import { Card, Text, Button } from 'tamagui';
import { useMutation } from '@tanstack/react-query';

// axios example
// const createPost = async (postData) => {
//   try {
//     const response = await axios.post(
//       'http://localhost:5000/api/posts',
//       postData,
//     );
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


const createPost = async (postData) => {
  try {
    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

export default function SampleMutationRequest() {
  const [mutationResult, setMutationResult] = useState(null);
  const mutation = useMutation({ mutationFn: createPost });

  // on submit, send HTTP request
  const handleSubmit = async () => {
    try {
      const data = await mutation.mutateAsync({
        author: '/users/ojM0WYJu24OtJfT5mQRW',
        comments: [
          {
            author: '/users/ojM0WYJu24OtJfT5mQRW',
            comment: 'Valid Input',
            creation_date: '2024-03-25 21:41:30.786000+00:00',
          },
        ],
        creation_date: '2024-03-25 23:45:20.786000+00:00',
        description: 'This input is formatted correctly!',
        likes: 0,
        pictures: [],
      });
      setMutationResult('Post Created!'); // Update state with mutation result
    } catch (error) {
      setMutationResult(JSON.stringify(error));
    }
  };

  return (
    <Card>
      <Card.Header />
      <Text> Test Mutation </Text>
      <Text> Results of mutation requests: {mutationResult} </Text>
      <Button onPress={handleSubmit}>Submit</Button>
      <Card.Footer />
      <Card.Background />
    </Card>
  );
}
