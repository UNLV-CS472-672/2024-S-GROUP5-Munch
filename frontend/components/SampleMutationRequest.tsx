// Sample Mutation to be used for reference (for POST, PUT, DELETE)

import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Card, Text, Button } from 'tamagui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { getCurrentDateTime } from '../utils/getCurrentDateTime';
import { UserContext } from '@/contexts/UserContext';

export default function SampleMutationRequest() {
  const { token } = useContext(UserContext);
  const { getToken, userId } = useAuth();

  const postData = {
    author: `users/${userId}`,
    comments: [],
    creation_date: getCurrentDateTime(),
    description: '#StaceyWasHere (Test Creating A Post)!',
    likes: 0,
    location: '36.1048299,-115.1454664',
    pictures: ['ROUTE/TO/SOME/PIC', 'ROUTE/TO/ANOTHER/PIC'],
  };

  const { mutate, isPending, data, error } = useMutation({
    mutationKey: ['UniqueNameSpecificToMutation'], // Optional: Descriptive key to identify this specific mutation
    mutationFn: () => {
      return axios.post(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts`,
        postData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    }, // Function that defines how to fetch data for this mutation
  });

  // on submit, send HTTP request
  const handleSubmit = async () => {
    mutate();
    console.log(data);
  };

  return (
    <>
      <Text> Test Mutation </Text>
      <Button onPress={handleSubmit}>
        {isPending ? 'Submitting...' : 'Submit'}
      </Button>
    </>
  );
}
