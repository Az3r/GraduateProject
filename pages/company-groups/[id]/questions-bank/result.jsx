import React, { useEffect } from 'react';
import Head from 'next/head';
import { parseCookies } from '@libs/client/cookies';
import { useRouter } from 'next/router';
import AppLayout from '@components/Layout';
import { find } from '@libs/client/users';
import { get as getDev, getProblemSubmissions } from '@libs/client/developers';
import ParticipantResults from '@components/CompanyGroups/DetailGroup/QuestionsBank/Detail/ParticipantResults';

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
        <title>Group Questions Bank | Smart Coder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppLayout>
        {submission ? <ParticipantResults submission={submission} /> : null}
      </AppLayout>
    </>
  );
}

export async function getServerSideProps({ req, query }) {
  const cookies = parseCookies(req);

  if (Object.keys(cookies).length !== 0) {
    if (cookies.user) {
      const user = await find(JSON.parse(cookies.user).uid);
      const { id, question, uid } = query;

      if (user.role === 'company') {
        if (id === user.id) {
          const submission = await getProblemSubmissions(uid, question);
          return {
            props: {
              user,
              submission,
            },
          };
        }
        return {
          props: {
            user: null,
          },
        };
      }
      const detailUser = await getDev(user.id);
      if (detailUser.companies.includes(id)) {
        const submission = await getProblemSubmissions(uid, question);
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
