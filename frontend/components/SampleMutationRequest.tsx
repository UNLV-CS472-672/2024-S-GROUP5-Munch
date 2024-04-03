// Sample Mutation to be used for reference (for POST, PUT, DELETE)

import React, { useState } from 'react';
import axios from 'axios';
import { Card, Text, Button } from 'tamagui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { getCurrentDateTime } from '../app/utils/getCurrentDateTime';

export default function SampleMutationRequest() {
  const [mutationResult, setMutationResult] = useState(null);
  const [error, setError] = useState(null);
  const { getToken, userId } = useAuth();

  // Make POST request with axios
  const createPost = async (postData) => {
    try {
      const token = await getToken();
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 201) {
        return response.data;
      } else {
        throw new Error(
          `Request failed with status ${response.status} and token ${token}`,
        );
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const mutation = useMutation({
    // mutationKey: ['UniqueNameSpecificToMutation'], // Optional: Descriptive key to identify this specific mutation
    mutationFn: createPost, // Function that defines how to fetch data for this mutation
  });

  // on submit, send HTTP request
  const handleSubmit = async () => {
    if (mutation.isPending) return; // Prevent multiple submissions
    try {
      const data = await mutation.mutateAsync({
        author: `users/${userId}`,
        comments: [],
        creation_date: getCurrentDateTime(),
        description: '#StaceyWasHere (Test Creating A Post)!',
        likes: 0,
        location: '36.1048299,-115.1454664',
        pictures: ['ROUTE/TO/SOME/PIC', 'ROUTE/TO/ANOTHER/PIC'],
      });
      setMutationResult('Post Created!');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Card>
      <Card.Header />
      <Text> Test Mutation </Text>
      <Button onPress={handleSubmit} disabled={mutation.isPending}>
        {mutation.isPending ? 'Submitting...' : 'Submit'}
      </Button>
      {mutation.isError && <Text>Error: {error}</Text>}
      {mutation.isSuccess && <Text>Mutation Result: {mutationResult}</Text>}
      <Card.Footer />
      <Card.Background />
    </Card>
  );
}
