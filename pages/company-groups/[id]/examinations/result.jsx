import React, { useEffect } from 'react';
import Head from 'next/head';
import { parseCookies } from '@libs/client/cookies';
import { useRouter } from 'next/router';
import AppLayout from '@components/Layout';
import { find } from '@libs/client/users';
import { get as getDev, getExamResults } from '@libs/client/developers';
import ParticipantResult from '@components/CompanyGroups/DetailGroup/Examinations/Detail/ParticipantResult';

export default function Index({ user, submission }) {
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  });

  return (
    <>
      <Head>
        <title>Group examinations - SmartCoder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppLayout>
        <ParticipantResult user={user} submission={submission[0]}/>
      </AppLayout>
    </>
  );
}

export async function getServerSideProps({ req, query }) {
  const cookies = parseCookies(req);

  if (Object.keys(cookies).length !== 0) {
    if (cookies.user) {
      const user = await find(JSON.parse(cookies.user).uid);
      const { id, exam, uid } = query;

      if (user.role === 'company') {
        if (id === user.id) {
          const submission = await getExamResults(uid, exam);
          return {
            props: {
              user,
              submission,
            },
          };
        }
      }
      const detailUser = await getDev(user.id);
      if (detailUser.companies.includes(id)) {
        const submission = await getExamResults(uid, exam);
        return {
          props: {
            user,
            submission,
          },
        };
      }
    }
  }
  return {
    props: {
      user: null,
    },
  };
}
