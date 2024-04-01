/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

import { FlatList } from 'react-native';
import { View } from 'tamagui';
import { Byte } from '@/types/post';
import Post from '@/components/Post';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';

const items = [
  {
    author: 0,
    comments: [
      {
        author: 'users/user_2cwMgsX7SwXnnnYJ2piefltKxLO',
        comment: 'Post Validation Unit Test Input',
        creation_date: '2024-03-25 22:53:36.118000+00:00'
      }
    ],
    creation_date: '2024-03-25 21:41:30.786000+00:00',
    description: 'Test to make sure author input is a string',
    likes: 0,
    location: '36.1048299,-115.1454664',
    pictures: [
      'https://hips.hearstapps.com/hmg-prod/images/190208-delish-ramen-horizontal-093-1550096715.jpg?crop=0.8893333333333334xw:1xh;center,top&resize=1200:*'
    ],
    key: 0
  },
  {
    title: 'Greek salad',
    description:
      "Try my family's famous greek salad. It is sure to be a crowd pleaser with tangy and refreshing vegetables",
    pictures: [
      'https://hips.hearstapps.com/hmg-prod/images/190208-delish-ramen-horizontal-093-1550096715.jpg?crop=0.8893333333333334xw:1xh;center,top&resize=1200:*'
    ],
    likes: 0,
    location: '36.12615249296258,-115.2213863475571',
    key: 1
  },
  {
    title: 'Banana cream pie',
    description:
      "My auntie's banana cream pie is to die for! She uses reduced plantains as a secret ingredient",
    pictures: [
      'https://s3-media0.fl.yelpcdn.com/bphoto/FtKvySmqPWrH8RuM0gGG4w/348s.jpg'
    ],
    key: 2
  },
  {
    title: 'Kimchi Fried Rice',
    description:
      'A quick an easy breakfast that I learned from a college roommate. You just need rice, kimchi, an egg, and whatever seasonings you want',
    pictures: [
      'https://s3-media0.fl.yelpcdn.com/bphoto/614yN_7tb8M22x-B4M3RVw/348s.jpg'
    ],
    key: 3
  },
  {
    title: 'Kimchi Fried Rice',
    description:
      'A quick an easy breakfast that I learned from a college roommate. You just need rice, kimchi, an egg, and whatever seasonings you want',
    pictures: [
      'https://s3-media0.fl.yelpcdn.com/bphoto/xCMfzTsxEf8ymnDuuUsbng/258s.jpg'
    ],
    key: 4
  }
];
export default function Index() {
  const { getToken } = useAuth();

  return (
    <View>
      <FlatList
        data={items}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        // pagingEnabled={true}
        // snapToAlignment='start'
        decelerationRate={'fast'}
        // disableIntervalMomentum={true}
      />
    </View>
  );
}
